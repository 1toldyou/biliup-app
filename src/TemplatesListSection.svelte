<svelte:options runes={true} />

<script lang="ts">
   import {confirm} from "@tauri-apps/plugin-dialog";

   import {addToActiveTemplates, allTemplates, saveAllTemplates} from "./store";
   import {NotificationPopMode, type StudioPayload} from "./type";
   import {addNotification} from "./notification";

   let currentTemplateCategory: string = $state("template");

   function addTemplate(name: string, template: StudioPayload) {
      if (name in $allTemplates[currentTemplateCategory]) {
         addNotification({msg: `Template "${name}" already exists`, type: NotificationPopMode.ERROR}, true);
         return;
      }

      $allTemplates[currentTemplateCategory][name] = template;

      saveAllTemplates();
   }

   function makeBlankTemplate(name: string): StudioPayload {
      return {
         aid: undefined,
         copyright: 0,
         cover: "",
         desc: "",
         desc_format_id: 0,
         desc_v2: undefined,
         dolby: 0,
         dtime: undefined,
         dynamic: "",
         interactive: 0,
         lossless_music: 0,
         mission_id: undefined,
         no_reprint: 0,
         open_elec: 0,
         open_subtitle: false,
         source: "",
         subtitle: undefined,
         tag: "",
         tid: 0,
         title: "",
         up_close_danmu: false,
         up_close_reply: false,
         up_selection_reply: false,
         videos: []
      };
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

      // TODO: not allow to remove if its in activeTemplates

      delete $allTemplates[currentTemplateCategory][name];
      $allTemplates[currentTemplateCategory] = $allTemplates[currentTemplateCategory];  // reactivity
   }

   function addTemplateCategory(category: string) {
      if (category === "") {
         addNotification({msg: `Category name cannot be empty`, type: NotificationPopMode.ERROR}, true);
         return;
      }

      if (category in $allTemplates) {
         addNotification({msg: `Category "${category}" already exists`, type: NotificationPopMode.ERROR}, true);
         return;
      }

      $allTemplates[category] = {};
   }

   function editTemplateName(currentName: string, newName: string) {
        if (currentName === newName) {
             return;
        }

        if (newName in $allTemplates[currentTemplateCategory]) {
             addNotification({msg: `Template "${newName}" already exists`, type: NotificationPopMode.ERROR}, true);
             return;
        }

        $allTemplates[currentTemplateCategory][newName] = $allTemplates[currentTemplateCategory][currentName];
        delete $allTemplates[currentTemplateCategory][currentName];
   }
</script>

<h1>Templates List</h1>

<section>
   <p>{currentTemplateCategory}</p>
   {#each Object.keys($allTemplates) as category}
      <button onclick={() => currentTemplateCategory = category}>{category}</button>
   {/each}

    <button onclick={() => addTemplateCategory("test")}>Add Category</button>
</section>

<hr class="divider">

<section>
   {#if currentTemplateCategory in $allTemplates}
      {#each Object.entries($allTemplates[currentTemplateCategory]) as [name, template]}
         <div style="border:1px solid black">
            <p>{name}</p>
            <p>{template.title}</p>

            <button onclick={() => addToActiveTemplates(currentTemplateCategory, name, structuredClone(template))}>Use</button>
            <button onclick={() => editTemplateName(name, `${name}+`)}>Edit Name</button>
            <button onclick={() => removeTemplate(name)}>Remove</button>
         </div>
      {/each}

      <button onclick={() => addTemplate(`test ${new Date()}`, makeBlankTemplate("test template"))}>Add Template</button>
   {:else}
        <p>No templates in category "{currentTemplateCategory}"</p>
   {/if}
</section>
