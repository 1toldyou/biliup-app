<script lang="ts">
    import {BackendCommands} from "./command";
    import {addNotification} from "./notification.js";
    import {NotificationPopMode} from "./type";
    import {allTemplates, loadAllTemplates} from "./store.js";
    import TemplatesList from "./TemplatesListSection.svelte";
    import WorkSection from "./WorkSection.svelte";

    BackendCommands.getMyInfo().then((res) => {
        console.log("BackendCommands.getMyInfo()", res);
        addNotification({type: NotificationPopMode.INFO, msg: `成功登录 ${res.data.mid} - ${res.data.name}`}, false);
    }).catch((e) => {
        console.error("BackendCommands.getMyInfo()", e);
    });

    loadAllTemplates();

    $: console.log("$allTemplates", $allTemplates);
</script>

<h1>Home Page</h1>

<div>
    <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onclick={() => addNotification({type: NotificationPopMode.INFO, msg: "A INFO Notification"}, true)}
    >
        Add Pop
    </button>
    <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onclick={() => addNotification({type: NotificationPopMode.ERROR, msg: "A ERROR Notification"}, true)}
    >
        Add Error Pop
    </button>
</div>

<div class="flex items-start">
    <div class="flex-none w-1/3" style="border:1px solid black">
        <TemplatesList/>
    </div>
    <hr>
    <div class="flex-none w-2/3" style="border:1px solid black">
        <p>Upload Section</p>
        <WorkSection/>
    </div>
</div>
