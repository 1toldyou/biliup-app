<svelte:options runes={true} />

<script lang="ts">
    import {isLoggedIn} from "./store";
    import {addNotification} from "./notification";
    import {NotificationPopMode} from "./type";
    import {BackendCommands} from "./command";
    import {QRCodeImage} from "svelte-qrcode-image";

    enum LoginMethod {
        NONE = "NONE",
        QR_CODE = "QR_CODE",
    }

    let accountList: string[] = $state([]);
    let loginButtonsLock = $state(false);
    let loginMethod: LoginMethod = $state(LoginMethod.NONE);

    let qrcodeURL: string = $state("");

    async function loadAccountList() {
        try {
            accountList = await BackendCommands.listAccounts();
        } catch (e) {
            console.error("BackendCommands.listAccounts()", e);
        }
    }

    async function continueWithCookieFile(cookieFilename: string) {
        loginButtonsLock = true;
        console.log("continueWithCookieFile()", cookieFilename);
        try {
            let resp = await BackendCommands.loginByCookieFile(cookieFilename);
            console.log("BackendCommands.loginByCookieFile()", resp);
            isLoggedIn.set(true);
        } catch (e) {
            console.error("BackendCommands.loginByCookieFile()", e);
        } finally {
            loginButtonsLock = false;
        }
    }

    async function loginByQrCodeButton(){
        loginMethod = LoginMethod.QR_CODE;
        qrcodeURL = "";
        let qrcodeInitialResponse;
        try {
            qrcodeInitialResponse = await BackendCommands.getQRCode();
            console.log("BackendCommands.getQrCode()", qrcodeInitialResponse);
            if (qrcodeInitialResponse.code !== 0) {
                addNotification({type: NotificationPopMode.ERROR, msg: qrcodeInitialResponse.message}, false);
                return;
            }
        } catch (e) {
            console.log("typeof e", typeof e, e.toString());
            addNotification({type: NotificationPopMode.ERROR, msg: `获取二维码时出现错误 ${e.toString()}`}, false);
            return;
        }

        qrcodeURL = qrcodeInitialResponse.data.url;

        let cookieFileName: string;

        try {
            cookieFileName = await BackendCommands.finishLoginByQRCode(qrcodeInitialResponse);
        } catch (e) {
            console.error("BackendCommands.finishLoginByQRCode()", e);
            addNotification({type: NotificationPopMode.ERROR, msg: `等待二维码登陆时出现错误 ${e as string}`}, false);
            return;
        }

        addNotification({type: NotificationPopMode.INFO, msg: `cookie文件保存在 ${cookieFileName}`}, false);

        await loadAccountList();
    }
</script>

<div class="container mx-auto">
    <div class="grid grid-cols-2">
        <div>
            <div>
                <button class="btn" onclick={loginByQrCodeButton}>扫码登录</button>
            </div>
            <div>
                {#if loginMethod === LoginMethod.QR_CODE}
                    {#if qrcodeURL !== ""}
                        <QRCodeImage text={qrcodeURL} width={10} />

                        <p>
                            {qrcodeURL}
                        </p>
                    {:else}
                        <p>正在获取二维码...</p>
                    {/if}
                {/if}
            </div>
        </div>
        <div>
            {#await loadAccountList()}
                <p>Loading accounts</p>
            {:then _}
                {#if accountList.length === 0}
                    <p>当前没有已登录的账号</p>
                {:else}
                    {#each accountList as account}
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
</div>

