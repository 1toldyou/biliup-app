<svelte:options runes={true} />

<script lang="ts">
    import {flip} from "svelte/animate";

    import {activeTemplates} from "./store";
    import {contentLimitation, CopyrightType} from "./lib/constants";
    import {NotificationPopMode} from "./type";
    import {addNotification} from "./notification";
    import VideoCategorizingSection from "./VideoCategorizingSection.svelte";
    import tippy, {animateFill} from "tippy.js";
    import {mount} from "svelte";

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

    function vidCatTip(node) {
        console.log("vidCatTip(node, combine)", node);
        let off;
        let detail;
        let partition;
        tippy(node, {
            arrow: false,
            trigger: 'click',
            allowHTML: true,
            theme: 'light',
            placement: 'bottom-start',
            animateFill: true,
            plugins: [animateFill],
            inertia: true,
            interactive: true,
            onCreate(instance) {
                console.log("onCreate(instance)", instance);
                console.log("mount(VideoCategorizingSection), target:", instance.popper.firstChild.lastChild);
                partition = mount(VideoCategorizingSection, {
                    target: instance.popper.firstChild.lastChild,
                    props: {
                        tid: $activeTemplates[index].data.tid,
                        parentCategoryName: currentParentCategoryName,
                        subCategoryName: currentSubCategoryName
                    },
                    events: {
                        "tid": event => {
                            console.log("partition.$on('tid', event)", event.detail);
                            instance.hide();
                            detail = event.detail;
                        }
                    }
                });
            },
            onShown(instance) {
                // @ts-ignore
                instance.popper.firstChild.lastChild.firstChild.firstChild.scrollTo({
                    top: detail?.scroll[0]?.offsetTop - 3,
                    // left: 100,
                    behavior: 'smooth'
                });
                // @ts-ignore
                instance.popper.firstChild.lastChild.firstChild.lastChild.scrollTo({
                    top: detail?.scroll[1]?.offsetTop - 8,
                    // left: 100,
                    behavior: 'smooth'
                });
                // console.log(instance.popper.firstChild.lastChild.firstChild.firstChild.scrollTop);
            },
            onDestroy(instance) {
                off();
            },
        });
    }

    let currentParentCategoryName = $state("");
    let currentSubCategoryName = $state("");

    $effect(() => {
        console.log("currentParentCategoryName", currentParentCategoryName);
        console.log("currentSubCategoryName", currentSubCategoryName);
    });
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

<section class="flex w-52" use:vidCatTip={{}}>
    <button class="border border-gray-300 relative w-full bg-white rounded-md pl-3 pr-10 py-3 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            type="button"
    >
        <span class="flex items-center">
            <span class="ml-1 block truncate">
                {currentParentCategoryName} → {currentSubCategoryName}
            </span>
        </span>
        <span class="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg aria-hidden="true" class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path clip-rule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" fill-rule="evenodd"></path>
            </svg>
        </span>
    </button>
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
