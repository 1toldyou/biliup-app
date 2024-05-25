<svelte:options runes={true} />

<script lang="ts">
    import {fade, scale} from 'svelte/transition';

    import {isLoggedIn} from "./store.svelte";
    import {addNotification} from "./notification.svelte.js";
    import {NotificationPopMode} from "./type";
    import {BackendCommands} from "./command";

    (async () => {
        try {
            let resp = await BackendCommands.listAccounts();
            console.log("BackendCommands.listAccounts()", resp);
        } catch (e: any) {
            addNotification({type: NotificationPopMode.ERROR, msg: e.toString(), date: new Date()}, false);
        }
    })();

    let loginButtonsLock = $state(false);

    async function continueWithCookieFile(cookieFilename: string) {
        loginButtonsLock = true;
        console.log("continueWithCookieFile()", cookieFilename);
        try {
            let resp = await BackendCommands.loginByCookieFile(cookieFilename);
            console.log("BackendCommands.loginByCookieFile()", resp);
            $isLoggedIn = true;
        } catch (e) {
            console.error("BackendCommands.loginByCookieFile()", e);
        } finally {
            loginButtonsLock = false;
        }
    }
</script>

<div class="abs min-h-screen flex flex-col sm:justify-center items-center bg-white " transition:fade>
    <div class="relative sm:max-w-sm w-full" transition:scale>
        {#await BackendCommands.listAccounts()}
            <p>Loading accounts</p>
        {:then accounts}
            {#if accounts.length === 0}
                <p>当前没有已登录的账号</p>
            {:else}
                {#each accounts as account}
                    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col my-2">
                        <p>{account}</p>
                        <button
                                onclick={()=>continueWithCookieFile(account)}
                                disabled={loginButtonsLock}
                        >
                            继续
                        </button>
                    </div>
                {/each}
            {/if}
        {:catch error}
                <p>加载账户列表时失败 {error}</p>
        {/await}
    </div>
</div>

