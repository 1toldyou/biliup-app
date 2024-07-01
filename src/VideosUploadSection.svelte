<svelte:options runes={true} />

<script lang="ts">
    import {open, confirm} from "@tauri-apps/plugin-dialog";

    import {BackendCommands} from "./command";
    import {activeTemplates} from "./store";
    import {NotificationPopMode} from "./type";
    import {addNotification} from "./notification";
    import {contentLimitation, videoExtensions} from "./lib/constants";

    let {
        templateIndex = $bindable()
    }: {templateIndex: number} = $props();

    let orderCheckbox = $state(false);
    let backgroundVisible = $state(true);

    function sortVideos() {
        console.log("orderCheckbox", orderCheckbox);

        $activeTemplates[templateIndex].data.files.sort((a, b) => {
            if (orderCheckbox) {
                return a.title.localeCompare(b.title);
            }
            else {
                return b.title.localeCompare(a.title);
            }
        });
        $activeTemplates[templateIndex].data.files = $activeTemplates[templateIndex].data.files;

        orderCheckbox = !orderCheckbox;
    }

    async function openFileSelectionDialog(){
        const selectedFiles = await open({
            multiple: true,
            filters: [{
                name: "Video",
                extensions: videoExtensions
            }]
        });

        if (Array.isArray(selectedFiles)) {
            // user selected multiple files
            console.log("selectedFiles", selectedFiles);
            uploadVideos(selectedFiles.map((file) => ({filename: file.name ?? "", absolutePath: file.path}))).then(()=>{});
        } else if (selectedFiles === null) {
            // user cancelled the selection
        } else {
            // user selected a single file
            console.warn("selectedFiles - single", selectedFiles);
        }
    }

    function makeFileID(filename: string): string {
        // remove things other than alphanumeric characters, `-`, `/`, `:` and `_`.
        filename = filename.replace(/[^a-zA-Z0-9\-\/:_]/g, "");
        return `${Date.now()}-${filename}`;
    }

    async function uploadVideos(files: {filename: string, absolutePath: string}[]) {
        console.log("uploadVideos()", files);
        files.forEach((file) => {
            if (file.filename === "" || file.absolutePath === "") {
                console.log("filename or absolutePath is empty for file", file);
                return;
            }
        });

        // check if the file is already selected or uploaded
        let toUpload: {filename: string, absolutePath: string}[] = [];
        files.forEach((file) => {
            if ($activeTemplates[templateIndex].data.files.some((f) => f.filename === file.filename)) {
                console.log("file already selected", file);
            }
            else {
                toUpload.push(file);
            }
        });
        console.log("toUpload", toUpload);

        if (toUpload.length === 0) {
            addNotification({type: NotificationPopMode.INFO, msg: "没有新文件需要上传"}, true);
            return;
        }
        else {
            addNotification({type: NotificationPopMode.INFO, msg: `需要上传 ${toUpload.length} 个文件`}, true);
        }

        for (let eachVideo of toUpload) {
            addNotification({type: NotificationPopMode.INFO, msg: `开始上传 ${eachVideo.filename}`}, false);
            let fileID = makeFileID(eachVideo.filename);
            uploadSingleVideo({title: eachVideo.filename, filename: eachVideo.absolutePath, desc: ""}, fileID).then(()=>{
                console.log("uploadSingleVideo() done", fileID);
            });
            activeTemplates.update((templates) => {
                templates[templateIndex].data.files = [
                    ...templates[templateIndex].data.files,
                    {
                        id: fileID,
                        title: eachVideo.filename,
                        filename: "",
                        absolutePath: eachVideo.absolutePath,
                        progress: 0,
                        speed: 0,
                        totalSize: 0,
                        started: true,
                        startTimestamp: Date.now(),
                        speedUploaded: 0, // necessary for speed calculation
                        size: 0,
                        desc: "",
                        uploadedSize: 0,
                        completed: false,
                    }
                ];
                return templates;
            });
        }
        console.log("uploadVideos() done");
    }

    async function uploadSingleVideo(v: {title: string, filename: string, desc: string}, id: string) {
        console.log(`uploadSingleVideo() for ${id}`, v );
        try {
            let resp = await BackendCommands.uploadVideo({title: v.title, filename: v.filename, desc: v.desc}, id);
            console.log(`uploadSingleVideo() done for ${id}`, resp);
            // TODO: handle the response

            activeTemplates.update((allTemplates) => {
                allTemplates.forEach((template) => { // finding in all templates in case the template is not currently selected
                    template.data.files.forEach((file) => {
                        if (file.id === id) {
                            file.filename = resp.filename;
                            file.progress = 100;
                            file.completed = true;
                            addNotification({type: NotificationPopMode.INFO, msg: `${v.title} 上传成功`}, true);
                        }
                    });
                });
                return allTemplates;
            });
        } catch (e) {
            console.error(`uploadSingleVideo() failed for ${id}`, e);
            addNotification({type: NotificationPopMode.ERROR, msg: `${v.title} 上传失败: ${e}`}, true);
        }
    }

    async function removeVideo(videoID: string) {
        console.log("removeVideo()", videoID);

        let title = $activeTemplates[templateIndex].data.files.find((file) => file.id === videoID)?.title;

        if (!(await confirm(`确定要移除 ${title} 吗？`))) {
            return;
        }

        activeTemplates.update((templates) => {
            templates[templateIndex].data.files = templates[templateIndex].data.files.filter((file) => file.id !== videoID);
            return templates;
        });
        // TODO: notify backend to abort the upload
    }

    function addExampleVideo() {
        $activeTemplates[templateIndex].data.files = [
            ...$activeTemplates[templateIndex].data.files,
            {
                id: makeFileID(`example ${$activeTemplates[templateIndex].data.files.length + 1}`),
                title: `example ${$activeTemplates[templateIndex].data.files.length + 1}`,
                filename: "",
                absolutePath: `example${$activeTemplates[templateIndex].data.files.length + 1}.mp4`,
                progress: Math.random() * 100,
                speed: Math.random() * 10,
                totalSize: Math.random() * 100000000,
                size: 0,
                desc: "",
                completed: false,
                uploadedSize: 0,
                speedUploaded: 0,
                startTimestamp: 0,
                started: false,
            }
        ];
    }

    function moveVideoPartUp(videoPartIndex: number){
        if (videoPartIndex === 0) {
            return;
        }
        activeTemplates.update((templates) => {
            let temp = templates[templateIndex].data.files[videoPartIndex];
            templates[templateIndex].data.files[videoPartIndex] = templates[templateIndex].data.files[videoPartIndex - 1];
            templates[templateIndex].data.files[videoPartIndex - 1] = temp;
            return templates;
        });
    }

    function moveVideoPartDown(videoPartIndex: number) {
        if (videoPartIndex === $activeTemplates[templateIndex].data.files.length - 1) {
            return;
        }
        activeTemplates.update((templates) => {
            let temp = templates[templateIndex].data.files[videoPartIndex];
            templates[templateIndex].data.files[videoPartIndex] = templates[templateIndex].data.files[videoPartIndex + 1];
            templates[templateIndex].data.files[videoPartIndex + 1] = temp;
            return templates;
        });
    }

    function moveVideoPartToTop(videoPartIndex: number) {
        if (videoPartIndex === 0) {
            return;
        }
        activeTemplates.update((templates) => {
            let temp = templates[templateIndex].data.files[videoPartIndex];
            templates[templateIndex].data.files.splice(videoPartIndex, 1);
            templates[templateIndex].data.files.unshift(temp);
            return templates;
        });
    }

    function moveVideoPartToBottom(videoPartIndex: number) {
        if (videoPartIndex === $activeTemplates[templateIndex].data.files.length - 1) {
            return;
        }
        activeTemplates.update((templates) => {
            let temp = templates[templateIndex].data.files[videoPartIndex];
            templates[templateIndex].data.files.splice(videoPartIndex, 1);
            templates[templateIndex].data.files.push(temp);
            return templates;
        });
    }
</script>

<div class="grid grid-flow-col mb-1">
    <label class="w-auto flex items-center font-bold tracking-wide">
        视频
        <button class="swap swap-rotate ml-2" onclick={sortVideos}>
            <svg xmlns="http://www.w3.org/2000/svg" class="swap-off fill-current h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" class="swap-on fill-current h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
        </button>
    </label>

    {#if backgroundVisible}
        <button type="button"
                onclick={openFileSelectionDialog}
                class="justify-self-end py-1.5 px-3 flex justify-center items-center w-max bg-green-500 hover:bg-green-700 focus:ring-green-500 focus:ring-offset-green-200 text-white transition ease-in duration-200 text-center text-xs font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-full"
        >
            <svg class="mr-2 w-3 h-3" fill="currentColor" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                <path d="M1344 1472q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm256 0q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm128-224v320q0 40-28 68t-68 28h-1472q-40 0-68-28t-28-68v-320q0-40 28-68t68-28h427q21 56 70.5 92t110.5 36h256q61 0 110.5-36t70.5-92h427q40 0 68 28t28 68zm-325-648q-17 40-59 40h-256v448q0 26-19 45t-45 19h-256q-26 0-45-19t-19-45v-448h-256q-42 0-59-40-17-39 14-69l448-448q18-19 45-19t45 19l448 448q31 30 14 69z"></path>
            </svg>
            添加视频
        </button>
    {/if}
</div>

{#if !backgroundVisible}
    <p>Drag and Drop</p>
{:else}
    <section class="bg-[#fafcfd] flex flex-col rounded-lg">
        {#each $activeTemplates[templateIndex].data.files as file, i}
            <div class="shadow-sm rounded-lg">
                <div class="flex items-center justify-center space-x-2 px-1">
                    <svg class="svg m-auto h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                    </svg>
                    <p>P{i+1}</p>
                    <div class="flex-grow w-0">
                        <div class="flex">
                            <div class="w-full">
                                <div class="flex w-full justify-between">
                                    {#if file.title.length <= contentLimitation.videoPartTitleLength}
                                        <input bind:value="{file.title}" class="bg-inherit w-full truncate"/>
                                    {:else}
                                        <input bind:value="{file.title}" class="bg-inherit w-full truncate bg-red-100 border border-red-300"/>
                                    {/if}
                                    <div class="text-gray-500 min-w-fit text-sm">{(file.totalSize/1024/1024).toFixed(2)} MiB</div>
                                </div>
                                <span class="block max bg-yellow-300 border-yellow-300 border-opacity-60 border rounded-full" class:complete={!file.completed} style="width: {file.progress}%;"></span>
                            </div>
                        </div>
                    </div>
                    <div class="flex-none flex flex-col w-20 h-12 justify-center items-center text-gray-500 font-mono text-xs">
                        <!-- This item will not grow -->
                        <div>{file.speed.toFixed(2)} MB/s</div>
                        <div>{file.progress.toFixed(2)} %</div>
                    </div>
                    <button onclick={()=>moveVideoPartUp(i)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                            <path fill-rule="evenodd" d="M11.47 7.72a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 0 1-1.06-1.06l7.5-7.5Z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <button onclick={()=>moveVideoPartDown(i)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                            <path fill-rule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 1 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <button onclick={()=>moveVideoPartToTop(i)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                            <path fill-rule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06l-6.22-6.22V21a.75.75 0 0 1-1.5 0V4.81l-6.22 6.22a.75.75 0 1 1-1.06-1.06l7.5-7.5Z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <button onclick={()=>moveVideoPartToBottom(i)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                            <path fill-rule="evenodd" d="M12.53 21.53a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 1 1 1.06-1.06l6.22 6.22V3a.75.75 0 0 1 1.5 0v16.19l6.22-6.22a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <button onclick={()=>removeVideo(file.id)}>
                        <svg class="del m-auto h-7 w-7" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path clip-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" fill-rule="evenodd"/>
                        </svg>
                    </button>
                </div>
            </div>
        {/each}
    </section>
{/if}

<button class="btn" onclick={addExampleVideo}>Add Example Video</button>
