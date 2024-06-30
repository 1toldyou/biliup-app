<script lang="ts">
    import {getVersion} from "@tauri-apps/api/app";
    import {SvelteToast} from '@zerodevx/svelte-toast'

    import {activeTemplates, allTemplates, isLoggedIn} from "./store";
    import {clearNotificationHistory, notificationHistory} from "./notification";
	import Login from "./LoginPage.svelte";
	import Home from "./HomePage.svelte";
    import Modal from "./lib/Modal.svelte";
    import {NotificationPopMode} from "./type";
    import {BackendCommands} from "./command";
    import SettingsPopup from "./SettingsPopup.svelte";

    window["biliup-debug"] = () => {
        console.log("isLoggedIn", isLoggedIn);
        console.log("notificationHistory", notificationHistory);
        console.log("$allTemplates", $allTemplates);
        console.log("$activeTemplates", $activeTemplates);
    }

    window["biliup-command"] = BackendCommands;
</script>

<main class="bg-gradient-to-b from-[#fefefe] to-[#e7f9f4]"
      on:dragenter|preventDefault
      on:dragleave|preventDefault
      on:dragover|preventDefault
      on:drop|preventDefault
>
    {#if $isLoggedIn}
        <Home/>
    {:else}
        <Login/>
    {/if}
    <div class="fixed space-y-2.5 top-0 right-0 w-1/2" id="alerts"></div>
    <ul class="menu bg-base-100 rounded-box fixed bottom-16 right-3 w-max drop-shadow">
        <li>
            <Modal>
                <span slot="open-modal">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </span>

                <div slot="box" class="px-4 border-b rounded-t sm:px-6">
                    <div class="bg-white my-2 shadow sm:rounded-md">
                        <ul class="divide-y divide-gray-200">
                            {#each $notificationHistory as notification}
                                <li>
                                    <div class="indicator w-full">
                                        <span class="!left-auto indicator-item indicator-top indicator-center">
                                            <label class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {notification.date.toLocaleString()}
                                            </label>
                                        </span>
                                        <div class="flex items-center px-2 pt-4 pb-2 hover:bg-gray-50 ">
                                            {#if notification.type === NotificationPopMode.ERROR}
                                                <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 stroke-warning flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            {:else }
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="mr-2 stroke-info flex-shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            {/if}
                                            <p class="text-gray-700 break-words max-w-[23rem]">
                                                {notification.msg}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            {/each}
                        </ul>
                    </div>


                    <p class="text-right text-sm text-slate-500">
                        通知历史
                        <button class="btn" on:click={clearNotificationHistory}>
                            清空
                        </button>
                    </p>
                </div>
            </Modal>
        </li>
        <li>
            <Modal>
                <span slot="open-modal">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
                <div slot="box" class="">
                    <h1 class="text-2xl font-bold text-center">
                        biliup-app
                        <span class="badge badge-primary">
                            {#await getVersion()}
                                waiting for the promise to resolve...
                            {:then value}
                                v{value}
                            {/await}
                        </span>
                    </h1>
                    <p class="mt-3">
                        欢迎使用，如果操作有一些疑问，可以先查看
                        <a class="text-blue-600 after:content-['_↗'] ..." href="https://biliup.github.io/biliup-app " target="_blank">文档</a>
                        里面有使用演示视频，下载地址（建议保持更新到最新版）与源码的地址。如果有什么建议可以在GitHub的issue中提出。
                        这个软件能帮到你的话，可以在GitHub上点个star，谢谢！
                </div>
            </Modal>
        </li>
        <li>
            <Modal>
                <span slot="open-modal">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                </span>
                <div slot="box" class="">
                    <SettingsPopup/>
                </div>
            </Modal>
        </li>
    </ul>

    <!-- TODO: style the toast -->
    <SvelteToast options={{}}/>
</main>

<style global lang="postcss">
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
</style>
