<svelte:options runes={true} />

<script lang="ts">
   import {confirm} from "@tauri-apps/plugin-dialog";

   import {allTemplates} from "./store";
   import {NotificationPopMode, type StudioPayload} from "./type";
   import {addNotification} from "./notification";

   let currentTemplateCategory: "template" | "videoEdit" = "template";

   function addTemplate(name: string, template: StudioPayload) {
      if (name in $allTemplates[currentTemplateCategory]) {
         addNotification({msg: `Template ${name} already exists`, type: NotificationPopMode.ERROR}, true);
         return;
      }

      $allTemplates[currentTemplateCategory][name] = template;
   }

   async function removeTemplate(name: string) {
      if (!(await confirm(`确定要移除模板 "${name}" 吗?`))) {
         return;
      }

      // check if the category exists
      if (!(currentTemplateCategory in $allTemplates)) {
         addNotification({msg: `Category ${currentTemplateCategory} does not exist`, type: NotificationPopMode.ERROR}, true);
         return;
      }

      // check if the template exists
      if (!(name in $allTemplates[currentTemplateCategory])) {
         addNotification({msg: `Template ${name} does not exist`, type: NotificationPopMode.ERROR}, true);
         return;
      }

      delete $allTemplates[currentTemplateCategory][name];
      $allTemplates[currentTemplateCategory] = $allTemplates[currentTemplateCategory];  // reactivity
   }
</script>

<h1>Templates List</h1>

<section>
   <p>Tabs</p>
</section>

<hr class="divider">

<section>
   <p>{currentTemplateCategory}</p>
   {#if currentTemplateCategory in $allTemplates}
      {#each Object.entries($allTemplates[currentTemplateCategory]) as [name, template]}
         <div>
            <p>{name}</p>
            <p>{template.title}</p>

            <button onclick={() => removeTemplate(name)}>Remove</button>
         </div>
      {/each}

      <button onclick={() => addTemplate("test", {title: "test template"})}>Add Template</button>
   {:else}
        <p>No templates in category "{currentTemplateCategory}"</p>
   {/if}
</section>
