<svelte:options runes={true} />

<script lang="ts">
    import {activeTemplates} from "./store";
    import UploadSection from "./UploadSection.svelte";

    let currentTemplateIndex: number = $state(-1);
</script>

<section class="flex">
    {#each $activeTemplates as templatePack, index}
        <div>
            <button class="btn" onclick={() => currentTemplateIndex = index}>
                {#if currentTemplateIndex === index}
                    <b>{templatePack.category} - {templatePack.name}</b>
                {:else}
                    <p>{templatePack.category} - {templatePack.name}</p>
                {/if}
            </button>
        </div>
    {/each}
</section>

<hr class="divider">

<section>
    {#if currentTemplateIndex >= 0}
        <div>
            <UploadSection index={currentTemplateIndex} />
        </div>
    {:else}
        <p>请选择一个模板</p>
    {/if}
</section>
