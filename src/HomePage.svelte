<script lang="ts">
    import {BackendCommands} from "./command";
    import {addNotification} from "./notification.svelte.js";
    import {NotificationPopMode} from "./type";

    BackendCommands.getMyInfo().then((res) => {
        console.log("BackendCommands.getMyInfo()", res);
        addNotification({type: NotificationPopMode.INFO, msg: `成功登录 ${res.data.mid} - ${res.data.name}`, date: new Date()}, false);
    }).catch((e) => {
        console.error("BackendCommands.getMyInfo()", e);
    });
</script>

<h1>Home Page</h1>

<div class="flex items-start">
    <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onclick={() => addNotification({type: NotificationPopMode.INFO, msg: "A Notification", date: new Date()}, true)}
    >
        Add Pop
    </button>
</div>
