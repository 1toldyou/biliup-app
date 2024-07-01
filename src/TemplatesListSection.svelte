<svelte:options runes={true} />

<script lang="ts">
   import {confirm} from "@tauri-apps/plugin-dialog";

   import {addToActiveTemplates, allTemplates, makeBlankTemplate, saveAllTemplates} from "./store";
   import {NotificationPopMode, type StudioPayload} from "./type";
   import {addNotification} from "./notification";
   import {BackendCommands, isExistingVideo} from "./command";

   let currentTemplateCategory: string = $state("template");
   let newTemplateName: string = $state("");

   function addNewTemplateOrExistingVideo(name: string){
      if (isExistingVideo(name)) {
         addExistingVideo(name);
      }
      else {
         addNewTemplate(name, makeBlankTemplate("test template"));
      }
   }

   function addNewTemplate(name: string, template: StudioPayload) {
      if (name === "") {
         addNotification({msg: `Template name cannot be empty`, type: NotificationPopMode.ERROR}, true);
         return;
      }

      if (name in $allTemplates[currentTemplateCategory]) {
         addNotification({msg: `Template "${name}" already exists`, type: NotificationPopMode.ERROR}, true);
         return;
      }

      $allTemplates[currentTemplateCategory][name] = template;
      console.log(`Added template ${name} to category ${currentTemplateCategory}`);

      // saveAllTemplates();
   }

   async function addExistingVideo(videoID: string){
      if (!(await BackendCommands.isVid(videoID))) {
         addNotification({msg: `${videoID} is not a valid av number or BV ID`, type: NotificationPopMode.ERROR}, true);
         return;
      }

      $allTemplates[currentTemplateCategory][videoID] = await BackendCommands.getExistingVideo(videoID);
      console.log(`Added template ${videoID} to category ${currentTemplateCategory}`);

      // await saveAllTemplates();
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
      // await saveAllTemplates();
   }

   function addTemplateCategory(category: string) {
      if (category === "") {
         addNotification({msg: `模板类别名称不能为空`, type: NotificationPopMode.ERROR}, true);
         return;
      }

      if (category in $allTemplates) {
         addNotification({msg: `模板类别 "${category}" 已存在`, type: NotificationPopMode.ERROR}, true);
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

<section>
<!--   <p>{currentTemplateCategory}</p>-->
   {#each Object.keys($allTemplates) as category}
      <button onclick={() => currentTemplateCategory = category} style="margin: 0.25vh">
         {#if category === currentTemplateCategory}
            <strong>{category}</strong>
         {:else}
            <p>{category}</p>
         {/if}
      </button>
   {/each}

    <button onclick={() => addTemplateCategory("test")}>添加模板类别</button>
</section>

<hr class="divider">

<section>
   {#if currentTemplateCategory in $allTemplates}
      {#each Object.entries($allTemplates[currentTemplateCategory]) as [name, template]}
         <div style="border:1px solid black">
            <p>{name}</p>
            <p>{template.title}</p>

            <button onclick={() => addToActiveTemplates(currentTemplateCategory, name, structuredClone(template))}>使用</button>
            <button onclick={() => editTemplateName(name, `${name}+`)}>编辑名称</button>
            <button onclick={() => removeTemplate(name)}>移除</button>
         </div>
      {/each}

      <input type="text" bind:value={newTemplateName} placeholder="模板名称" />
      <button onclick={() => addNewTemplateOrExistingVideo(newTemplateName)}>添加模板</button>
   {:else}
        <p>"{currentTemplateCategory}" 类别下没有模板</p>
   {/if}
</section>
