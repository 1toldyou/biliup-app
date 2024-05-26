<svelte:options runes={true} />

<script lang="ts">
    import {BackendCommands} from "./command";

    BackendCommands.archivePre().then((res) => {
        console.log("BackendCommands.archivePre()", res);
    }).catch((e) => {
        console.error("BackendCommands.archivePre()", e);
    });

    let currentParentCategoryID = $state(0);
    let currentChildCategoryID = $state(0);
</script>

<p>分区列表</p>
{#await BackendCommands.archivePre()}
    <p>加载分区列表中</p>
{:then res}
    {#if res.code === 0}
        <div class="max-h-52 grid grid-flow-col divimax-h-52 items-center justify-cde-x-2">
            <div class="container overflow-y-scroll enter bg-white dark:bg-gray-800">
                {#each res.data.typelist as parentCategory}
                    <button class:selected="{currentParentCategoryID === parentCategory.id}"
                         class="py-2 pr-0 flex text-gray-600 justify-between items-center cursor-pointer hover:bg-gray-200 hover:text-gray-700"
                         onclick={() => currentParentCategoryID = parentCategory.id}
                    >
                        <span class="ml-3.5 font-medium dark:text-gray-200 text-base">
                            {parentCategory.name}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </button>
                {/each}
            </div>
            <div class="overflow-y-auto max-h-52 py-1.5">
                {#each res.data.typelist as parentCategory}
                    {#if parentCategory.id === currentParentCategoryID}
                        {#each parentCategory.children as tid}
                            <button class:selected="{currentChildCategoryID === tid.id}"
                                    class="p-2.5 cursor-pointer hover:bg-gray-200 hover:text-gray-700"
                                    onclick={()=> currentChildCategoryID = tid.id}
                                    onkeydown={()=> currentChildCategoryID = tid.id}
                            >
                                <span class="font-weight">{tid.name}</span>
                                <span class="ml-2.5 text-xs text-black text-opacity-50">{tid.desc}</span>
                            </button>
                        {/each}
                    {/if}
                {/each}
            </div>
        </div>
    {:else}
        <p>{res.message}</p>
    {/if}
{:catch e}
    <p>分区列表加载失败</p>
{/await}

<style>
    .selected {
        color: #687ef2 !important;
        /*@apply text-gray-700 bg-gray-200;*/
    }
</style>
