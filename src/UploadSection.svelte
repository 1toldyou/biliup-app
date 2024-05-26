<svelte:options runes={true} />

<script lang="ts">
    import {flip} from "svelte/animate";

    import {activeTemplates} from "./store";
    import {contentLimitation, CopyrightType} from "./lib/constants";
    import {NotificationPopMode} from "./type";
    import {addNotification} from "./notification";
    import VideoCategorizingSection from "./VideoCategorizingSection.svelte";

    let {index}: {index: number} = $props();

    /* variables for inputs */
    let noReprintCheckbox: boolean = $state($activeTemplates[index].data.no_reprint === 1);
    $effect(() => {
        $activeTemplates[index].data.no_reprint = noReprintCheckbox ? 1 : 0;
    });
    let tagInput: string = $state("");

    function removeTag(tag: string) {
        let currentTags = $activeTemplates[index].data.tag.split(",");
        let newTags = currentTags.filter((t) => t !== tag);
        $activeTemplates[index].data.tag = newTags.join(",");
    }

    function handleTagEnter() {
        if (tagInput === "") {
            return;
        }

        if (tagInput.includes(",")) {
            addNotification({msg: `标签不能包含逗号`, type: NotificationPopMode.ERROR}, true);
            return;
        }

        if (tagInput.length > contentLimitation.individualTagLength) {
            addNotification({msg: `标签长度不能超过${contentLimitation.individualTagLength}个字符，当前${tagInput.length}个字符`, type: NotificationPopMode.ERROR}, true);
            return;
        }

        let currentTags = $activeTemplates[index].data.tag.split(",").filter((v) => v !== "");
        if (currentTags.includes(tagInput)) {
            addNotification({msg: `标签 "${tagInput}" 已存在`, type: NotificationPopMode.ERROR}, true);
            return;
        }

        if (currentTags.length >= contentLimitation.tagsCount) {
            addNotification({msg: `标签数量不能超过${contentLimitation.tagsCount}个`, type: NotificationPopMode.ERROR}, true);
            return;
        }

        $activeTemplates[index].data.tag = currentTags.concat(tagInput).join(",");
        tagInput = "";
    }
</script>

<h1>Upload for {$activeTemplates[index].category} - {$activeTemplates[index].name}</h1>

<section>
    {#if $activeTemplates[index].data.title.length > contentLimitation.titleLength}
        <input class="w-full bg-red-100 border border-red-300" type="text" bind:value={$activeTemplates[index].data.title} placeholder="标题，长度限制{contentLimitation.titleLength}个字符">
    {:else}
        <input class="w-full bg-white-100 border border-gray-300" type="text" bind:value={$activeTemplates[index].data.title} placeholder="标题，长度限制{contentLimitation.titleLength}个字符">
    {/if}
</section>

<section class="bg-[#fafcfd] border rounded-md px-2 py-1">
    <div>
        <div class="form-control">
            <label class="label cursor-pointer">
                <span class="label-text font-bold">自制</span>
                <input type="radio" name="radio-10" class="radio checked"
                       checked={$activeTemplates[index].data.copyright === CopyrightType.original}
                       onclick={()=>{$activeTemplates[index].data.copyright = CopyrightType.original}}
                />
            </label>
        </div>
        <div class="form-control">
            <label class="label cursor-pointer">
                <span class="label-text font-bold">转载</span>
                <input type="radio" name="radio-10" class="radio checked"
                       checked={$activeTemplates[index].data.copyright === CopyrightType.reprint}
                       onclick={()=>{$activeTemplates[index].data.copyright = CopyrightType.reprint}}
                />
            </label>
        </div>
    </div>

    {#if $activeTemplates[index].data.copyright === CopyrightType.original}
        <div class="form-control">
            <label class="label cursor-pointer">
                <span class="label-text">自制声明：未经作者授权 禁止转载</span>
                <input type="checkbox" bind:checked="{noReprintCheckbox}" class="checkbox">
            </label>
        </div>
    {:else}
        {#if $activeTemplates[index].data.source.length <= contentLimitation.reprintUrlLength}
            <input bind:value={$activeTemplates[index].data.source} class="input w-full" placeholder="转载来源" type="text"/>
        {:else}
            <input bind:value={$activeTemplates[index].data.source} class="input w-full bg-red-100 border border-red-300" placeholder="转载来源" type="text"/>
        {/if}
    {/if}
</section>

<section>
    <VideoCategorizingSection/>
</section>

<section class="flex flex-wrap rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent">
    {#each $activeTemplates[index].data.tag.split(",").filter((v)=> v !== "") as tag(tag)}
        <span animate:flip="{{duration: 300}}" class="flex  ml-1 my-1.5 px-3 py-0.5 text-base rounded-full text-white  bg-indigo-500 ">
            {tag}
            <button onclick={()=>{removeTag(tag)}} class="bg-transparent hover">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="ml-2" viewBox="0 0 1792 1792">
                    <path d="M1490 1322q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68 28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68l-294 294 294 294q28 28 28 68z"></path>
                </svg>
            </button>
        </span>
    {/each}
    <input bind:value={tagInput} class="outline-none rounded-lg flex-1 appearance-none  w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base " onkeydown={e=>e.key==="Enter" && handleTagEnter()}
           placeholder="标签，回车输入"
           type="text"
    />
</section>

<section class="text-gray-700">
    <div class="label">
        <span class="text-sm font-bold text-gray-500 tracking-wide">
            简介
            <sub>{$activeTemplates[index].data.desc.length}/{contentLimitation.descriptionLengthByZone($activeTemplates[index].data.tid)}</sub>
        </span>
    </div>
    {#if $activeTemplates[index].data.desc.length <= contentLimitation.descriptionLengthByZone($activeTemplates[index].data.tid)}
        <textarea bind:value={$activeTemplates[index].data.desc}
                  class="textarea textarea-bordered w-full"
                  cols="40" rows="4" placeholder="简介补充: ..."
        ></textarea>
    {:else}
        <textarea bind:value={$activeTemplates[index].data.desc}
                  class="textarea textarea-bordered w-full bg-red-100 border border-red-300"
                  cols="40" rows="4" placeholder="简介补充: ..."
        ></textarea>
    {/if}
</section>

<section class="text-gray-700">
    <div class="label">
        <span class="text-sm font-bold text-gray-500 tracking-wide">
            粉丝动态
            <sub>{$activeTemplates[index].data.dynamic.length}/{contentLimitation.dynamicMessageLength}</sub>
        </span>
    </div>
    {#if $activeTemplates[index].data.dynamic.length <= contentLimitation.dynamicMessageLength}
        <textarea bind:value={$activeTemplates[index].data.dynamic}
                  class="textarea textarea-bordered w-full"
                  cols="40" rows="1" placeholder="动态描述"
        ></textarea>
    {:else}
        <textarea bind:value={$activeTemplates[index].data.dynamic}
                  class="textarea textarea-bordered w-full bg-red-100 border border-red-300"
                  cols="40" rows="1" placeholder="动态描述"
        ></textarea>
    {/if}
</section>
