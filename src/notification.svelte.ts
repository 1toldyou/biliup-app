import {type NotificationPopEntry, NotificationPopMode} from "./type";
import {toast} from "@zerodevx/svelte-toast";


export let notificationHistory: NotificationPopEntry[] = $state([]);

export function addNotification(entry: {msg: string, type: NotificationPopMode}, pop: boolean) {
    notificationHistory.push({msg: entry.msg, type: entry.type, date: new Date()});
    if (pop) {
        createPop(entry.msg, 3000, entry.type);
    }
}

export function createPop(msg: string, duration = 3000, mode: NotificationPopMode) {
    let toastTheme: {
        [x: string]: string | number
    };
    switch (mode) {
        case NotificationPopMode.ERROR:
            toastTheme = {
                "--toastBarBackground": "red",
            }
            break;
        default:
            toastTheme = {};
    }
    
    toast.push(msg, {
        duration: duration,
        theme: toastTheme,
    });
}
