<svelte:options runes={true} />

<script lang="ts">
    import {activeTemplates} from "./store";

    let {index}: {index: number} = $props();
</script>

<h1>Upload for {$activeTemplates[index].category} - {$activeTemplates[index].name}</h1>

<input type="text" bind:value={$activeTemplates[index].data.title} placeholder="标题">
