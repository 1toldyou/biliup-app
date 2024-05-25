import {invoke} from "@tauri-apps/api/core";
// import {check_outros, group_outros, transition_out} from "svelte/internal";

import {type NotificationPopEntry, NotificationPopMode} from "./type";
import Pop from "./lib/Pop.svelte";
import {BackendCommands} from "./command";
import {mount} from "svelte";


export let notificationHistory: NotificationPopEntry[] = $state([]);

export function addNotification(entry: NotificationPopEntry, pop: boolean) {
    notificationHistory.push(entry);
    if (pop) {
        createPop(entry.msg, 3000, entry.type);
    }
}

export function createPop(msg: string, duration = 3000, mode: NotificationPopMode) {
    // const pop = new Pop({
    //     target: document.querySelector('#alerts'),
    //     intro: true,
    //     props: {
    //         msg: msg,
    //         mode: mode
    //     }
    // });
    mount(Pop, {
        target: document.querySelector('#alerts'), props: {msg, mode}
    });
    setTimeout(() => outroAndDestroy(pop), duration);
    console.log("pop created");
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
