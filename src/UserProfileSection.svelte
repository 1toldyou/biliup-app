<svelte:options runes={true} />

<script lang="ts">
    import {open} from "@tauri-apps/plugin-shell";
    import {fetch} from "@tauri-apps/plugin-http";

    import {BackendCommands} from "./command";
    import {addNotification} from "./notification";
    import {NotificationPopMode} from "./type";

    let faceURL: string = $state("");
    let faceData: string = $state("");
    let name: string = $state("");
    let mid: number = $state(0);

    BackendCommands.getMyInfo().then((res) => {
        console.log("BackendCommands.getMyInfo()", res);
        addNotification({type: NotificationPopMode.INFO, msg: `成功登录 ${res.data.mid} - ${res.data.name}`}, false);

        faceURL = res.data.face;
        name = res.data.name;
        mid = res.data.mid;
    }).catch((e) => {
        console.error("BackendCommands.getMyInfo()", e);
    });

    function openSpacePage() {
        if (!mid) {
            return;
        }

        open(`https://space.bilibili.com/${mid}`);
    }

    $effect(() => {
        if (!faceURL) {
            return;
        }

        console.log("faceURL", faceURL);
        fetch(faceURL).then((res) => {
            return res.arrayBuffer();
        }).then((arrayBuffer) => {
            faceData = `data:image/png;base64,${btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))}`;
            console.log(`Converted ${faceURL} to base64`, faceData);
        }).catch((e) => {
            console.error("fetch(faceURL)", e);
        });
    });
</script>

<div class="flex items-center flex-none">
    {#if faceURL}
        <img class="object-cover rounded-full h-9 w-9 cursor-pointer hover:ring-2 hover:ring-purple-600 hover:ring-offset-2" src="{faceData}" alt="avatar"/>
    {/if}

    <span onclick={openSpacePage} onkeydown={openSpacePage}
          role="button" tabindex="0"
          class="ml-2 font-medium text-gray-800 hover:underline truncate max-w-[8rem]"
    >
            {name}
    </span>
</div>

