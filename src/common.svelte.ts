import {invoke} from "@tauri-apps/api/core";
// import {check_outros, group_outros, transition_out} from "svelte/internal";

import {type NotificationPopEntry, NotificationPopMode} from "./type";
import Pop from "./Pop.svelte";
import {INVOKE_COMMANDS} from "./lib/constants";


export let notificationHistory: NotificationPopEntry[] = $state([]);

export function createPop(msg: string, duration = 3000, mode: NotificationPopMode) {
    invoke(INVOKE_COMMANDS.log, {level: mode, msg: msg}).then(r => console.log(`invoke(${INVOKE_COMMANDS.log})`, r));
    notificationHistory.push({
        type: mode,
        msg: msg,
        date: new Date(),
    });
    
    const pop = new Pop({
        target: document.querySelector('#alerts'),
        intro: true,
        props: {
            msg: msg,
            mode: mode
        }
    });
    setTimeout(() => outroAndDestroy(pop), duration);
}


// Workaround for https://github.com/sveltejs/svelte/issues/4056
const outroAndDestroy = (instance) => {
    if (instance.$$.fragment && instance.$$.fragment.o) {
        group_outros();
        transition_out(instance.$$.fragment, 0, 0, () => {
            instance.$destroy();
        });
        check_outros();
    } else {
        instance.$destroy();
    }
};
