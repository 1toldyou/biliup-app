import {get, type Writable, writable} from "svelte/store";
import {BaseDirectory, exists, readTextFile, writeTextFile} from "@tauri-apps/plugin-fs";

import {NotificationPopMode, type StudioPayload} from "./type";
import {addNotification} from "./notification.js";

// /* global state */
export let isLoggedIn: Writable<boolean> = writable(false);  // Cannot export state from a module if it is reassigned. Either export a function returning the state value or only mutate the state value's properties

/* file-based persistent storage */
type TemplatesStorage = {
    template: {[name: string]: StudioPayload},
    videoEdit: {[name: string]: StudioPayload},
}
const configFileNames = {
    templates: "biliup/templates.json",
}

// export let allTemplates: Writable<StudioPayload[]> = writable([]);
// export let allVideoEdits: Writable<StudioPayload[]> = writable([]);
// export let allTemplates: StudioPayload[] = $state([]);
// export let allVideoEdits: StudioPayload[] = $state([])
export let allTemplates: Writable<{[category: string]: {[name: string]: StudioPayload}}> = writable({});

export async function reloadTemplatesAndEdits() {
    if (!(await exists(configFileNames.templates, {baseDir: BaseDirectory.Config}))) {
        console.log(`${configFileNames.templates} does not exist, creating...`);
        addNotification({msg: "默认模板文件不存在，创建中", type: NotificationPopMode.INFO}, false);
        try {
            let emptyTemplatesStorage: TemplatesStorage = {
                template: {},
                videoEdit: {},
            }
            await writeTextFile(configFileNames.templates, JSON.stringify(emptyTemplatesStorage), {baseDir: BaseDirectory.Config});
        } catch (e) {
            console.error("reloadTemplatesAndEdits()", e);
            addNotification({msg: `默认模板文件创建失败: ${e}`, type: NotificationPopMode.ERROR}, true);
            return;
        }
    }
    
    try {
        let templatesFile = await readTextFile(configFileNames.templates, {baseDir: BaseDirectory.Config});
        let templatesFileJSON: TemplatesStorage = JSON.parse(templatesFile);
        console.log("templatesFileJSON", templatesFileJSON);
        
        // allTemplates = templatesFileJSON.templates;
        // allVideoEdits = templatesFileJSON.videoEdits;
        allTemplates.set(templatesFileJSON);
    } catch (e) {
        console.error("reloadTemplatesAndEdits()", e);
        addNotification({msg: `模板文件读取失败: ${e}`, type: NotificationPopMode.ERROR}, true);
    }
}

export async function saveTemplatesAndEdits() {
    let templatesStorage: TemplatesStorage = {
        template: get(allTemplates)["template"],
        videoEdit: get(allTemplates)["videoEdits"],
    } // TODO: check for possible undefined
    
    let templatesStorageJSON = JSON.stringify(templatesStorage);
    try {
        await writeTextFile(configFileNames.templates, templatesStorageJSON, {baseDir: BaseDirectory.Config});
    } catch (e){
        console.error("saveTemplatesAndEdits()", e);
        addNotification({msg: `模板文件写入失败: ${e}`, type: NotificationPopMode.ERROR}, true);
    }
}
