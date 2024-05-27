<svelte:options runes={true} />

<script lang="ts">
    import {confirm} from "@tauri-apps/plugin-dialog";
    import {fetch} from "@tauri-apps/plugin-http";  // need to use tauri fetch for hot linking
    import type {FilePond as FilePondInstance, FilePondFile, FilePondServerConfigProps} from "filepond";
    import FilePond, {registerPlugin} from "svelte-filepond";
    import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
    import FilePondPluginImagePreview from "filepond-plugin-image-preview";
    import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
    import "filepond/dist/filepond.css";
    import "filepond-plugin-image-edit/dist/filepond-plugin-image-edit.css";
    import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

    import {BackendCommands} from "./command";
    import {activeTemplates} from "./store";
    import {NotificationPopMode} from "./type";
    import {addNotification} from "./notification";

    let {
        templateIndex = $bindable()
    }: {templateIndex: number} = $props();

    let pond: FilePondInstance;
    let filePondName = "cover-pond";
    let filePondLabelIdle = `<span class="filepond--label-action">选择</span>并上传视频封面`;

    registerPlugin(
        FilePondPluginFileValidateType,
        FilePondPluginImageExifOrientation,
        FilePondPluginImagePreview,
    );

    let filepondServer: FilePondServerConfigProps["server"] = {
        process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
            progress(false, 0, 0);

            (async () => {
                try {
                    console.log(`uploading ${file.name} for template ${templateIndex}`);
                    let coverURL = await BackendCommands.coverUpload(await file.arrayBuffer());
                    console.log("BackendCommands.coverUpload()", coverURL);
                    $activeTemplates[templateIndex].data.cover = coverURL;
                    addNotification({msg: `封面上传成功`, type: NotificationPopMode.INFO}, false);
                    load(coverURL);
                    $activeTemplates[templateIndex].data.cover = $activeTemplates[templateIndex].data.cover;
                } catch (e) {
                    let errorText: string;
                    if (e && typeof e == "object" && e.hasOwnProperty("toString")) {
                        errorText = e.toString();
                    } else {
                        errorText = "unknown error occurred in filepondServer.process()";
                        console.error("filepondServer.process()", e);
                    }
                    error(errorText);
                    addNotification({msg: `封面上传失败: ${e}`, type: NotificationPopMode.ERROR}, true);
                }
            })();
            // Should expose an abort method so the request can be cancelled
            return {
                abort: () => {
                    // This function is entered if the user has tapped the cancel button
                    // request.abort();

                    // Let FilePond know the request has been cancelled
                    abort();
                },
            };
        },

        load: (source: string, load, error, progress, abort, headers) => {
            console.debug("load: (source, load, error, progress, abort, headers)", source);

            progress(false, 0, 0);

            // Should call the load method with a file object or blob when done
            (async () => {
                try {
                    const resp = await fetch(source, {method: "GET", referrer: ""});
                    console.debug("fetch(source)", resp);
                    if (resp.status >= 400) {
                        addNotification({msg: `封面加载失败，状态码${resp.status}`, type: NotificationPopMode.ERROR}, true);
                        error(`HTTP error ${resp.status} from ${source}`);
                    }

                    load(await resp.blob());
                } catch (e) {
                    let errorText: string;
                    if (e && typeof e == "object" && e.hasOwnProperty("toString")) {
                        errorText = e.toString();
                    } else {
                        errorText = "unknown error occurred in filepondServer.load()";
                        console.error("filepondServer.load()", e);
                    }
                    error(errorText);
                    addNotification({msg: `封面加载失败: ${e}`, type: NotificationPopMode.ERROR}, true);
                    console.log(e);
                }
            })();

            // Should expose an abort method so the request can be cancelled
            return {
                abort: () => {
                    // User tapped cancel, abort our ongoing actions here

                    // Let FilePond know the request has been cancelled
                    abort();
                },
            };
        },
    };

    let uploadedCover: any[] = $state([]);
    $effect(() => {
        console.log(`$activeTemplates[${templateIndex}].data.cover`, $activeTemplates[templateIndex].data.cover);
        if ($activeTemplates[templateIndex].data.cover){
            uploadedCover = [{
                // the server file reference
                source: $activeTemplates[templateIndex].data.cover,

                // set type to local to indicate an already uploaded file
                options: {
                    type: "local",
                },
            }];
        }
        else {
            console.log("No cover found in for template", templateIndex);
            uploadedCover = [];
        }
    });

    $effect(() => {
        console.log(`Cover for ${templateIndex} updated to`, $activeTemplates[templateIndex].data.cover);
    });

    // $effect(() => console.log("pond", pond));

    async function removeFile() {
        if (!(await confirm("确定要移除封面吗？"))) {
            return;
        }

        pond.removeFiles();
        $activeTemplates[templateIndex].data.cover = "";
    }
</script>

<p>Cover upload for template {templateIndex}</p>
<FilePond bind:this={pond}
          name={filePondName}
          labelIdle={filePondLabelIdle}
          server={filepondServer}
          files={uploadedCover}
          credits={false}
          acceptedFileTypes="image/png, image/jpeg, image/gif"
          beforeRemoveFile={(item: FilePondFile) => {
              return false;  // it will be removed when switch to another template, even without pressing the built-in remove button
          }}
          iconRemove=""
/>
<button class="btn" onclick={removeFile}>移除封面</button>
<p>Cover: {$activeTemplates[templateIndex].data.cover}</p>
