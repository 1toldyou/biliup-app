import {type NotificationPopEntry, NotificationPopMode} from "./type";
import {toast} from "@zerodevx/svelte-toast";


export let notificationHistory: NotificationPopEntry[] = $state([]);

export function addNotification(entry: NotificationPopEntry, pop: boolean) {
    notificationHistory.push(entry);
    if (pop) {
        createPop(entry.msg, 3000, entry.type);
    }
}

export function createPop(msg: string, duration = 3000, mode: NotificationPopMode) {
    toast.push(msg, {
        duration: duration,
        theme: {toast: mode.toLowerCase()}
    });
}
