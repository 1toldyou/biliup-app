<svelte:options runes={true} />

<script lang="ts">
    import {activeTemplates} from "./store";
    import UploadSection from "./UploadSection.svelte";

    let currentTemplateIndex: number = $state(-1);
</script>

<h1>Work Section</h1>

<section>
    {#each $activeTemplates as templatePack, index}
        <div>
            {#if currentTemplateIndex === index}
                <b>{templatePack.category} - {templatePack.name}</b>
            {:else}
                <p>
                    {templatePack.category} - {templatePack.name}
                    <button onclick={() => currentTemplateIndex = index}>
                        Select
                    </button>
                </p>
            {/if}
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
        <p>Add a template and select it</p>
    {/if}
</section>
