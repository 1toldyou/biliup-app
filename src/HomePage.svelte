<script lang="ts">
    import {BackendCommands} from "./command";

    BackendCommands.getMyInfo().then((res) => {
        console.log("BackendCommands.getMyInfo()", res);
    }).catch((e) => {
        console.error("BackendCommands.getMyInfo()", e);
    });
</script>

<h1>Home Page</h1>

<div class="flex items-start">

</div>
