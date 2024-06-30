<svelte:options runes={true} />


<script lang="ts">
    import {setupBackendEventListening} from "./command";
    import {addNotification} from "./notification";
    import {NotificationPopMode} from "./type";
    import {allTemplates, loadAllTemplates} from "./store";
    import TemplatesList from "./TemplatesListSection.svelte";
    import WorkSection from "./WorkSection.svelte";
    import UserProfileSection from "./UserProfileSection.svelte";

    loadAllTemplates();

    $effect(() => console.log("$allTemplates", $allTemplates));

    setupBackendEventListening();
</script>

<!--<section>-->
<!--    <h1>Home Page</h1>-->
<!--    -->
<!--    <button-->
<!--            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"-->
<!--            onclick={() => addNotification({type: NotificationPopMode.INFO, msg: "A INFO Notification"}, true)}-->
<!--    >-->
<!--        Add Pop-->
<!--    </button>-->
<!--    <button-->
<!--            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"-->
<!--            onclick={() => addNotification({type: NotificationPopMode.ERROR, msg: "A ERROR Notification"}, true)}-->
<!--    >-->
<!--        Add Error Pop-->
<!--    </button>-->
<!--</section>-->

<div class="flex items-start">
    <div class="flex-none w-1/3" style="border:1px solid black">
        <UserProfileSection/>
        <TemplatesList/>
    </div>
    <hr>
    <div class="flex-none w-2/3" style="border:1px solid black">
        <WorkSection/>
    </div>
</div>
