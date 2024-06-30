import {type NotificationPopEntry, NotificationPopMode} from "./type";
import {toast} from "@zerodevx/svelte-toast";
import {type Writable, writable} from "svelte/store";


export let notificationHistory: Writable<NotificationPopEntry[]> = writable([]);

export function addNotification(entry: {msg: string, type: NotificationPopMode}, pop: boolean) {
    // $notificationHistory = [...$notificationHistory, {msg: entry.msg, type: entry.type, date: new Date()}];  // also works, but showing as error in IDE
    notificationHistory.update((history) => {
        return [...history, {msg: entry.msg, type: entry.type, date: new Date()}];
    });
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

export function clearNotificationHistory() {
    notificationHistory.set([]);
}

