<script lang="ts">
    import {submitInterface, uploadLine, uploadThreads} from "./store";
    import {SubmitInterfaces, UploadLines} from "./command";
</script>

<h1 class="text-2xl font-bold text-center">设置</h1>


<div class="space-y-2.5">
    <h4>单视频并发数：{$uploadThreads}</h4>
    <input type="range" max="16" min="1" bind:value={$uploadThreads} class="range range-xs">

    <h4>上传线路选择：</h4>
    <div class="join">
        {#each Object.keys(UploadLines) as l}
            <input type="radio" bind:group={$uploadLine} value={l} data-title={l} aria-label={l} class="join-item btn btn-outline">
        {/each}
    </div>

    <h4>提交接口选择：</h4>
    <div class="join">
        {#each Object.keys(SubmitInterfaces) as l}
            <input type="radio" bind:group={$submitInterface} value={l} data-title={l} aria-label={l} class="join-item btn btn-outline">
        {/each}
    </div>
</div>
