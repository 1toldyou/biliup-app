import {get, type Writable, writable} from "svelte/store";
import {BaseDirectory, create as createFile, exists, readTextFile, writeTextFile} from "@tauri-apps/plugin-fs";

import {NotificationPopMode, type StudioPayload} from "./type";
import {addNotification} from "./notification.svelte";

/* global state */
export let isLoggedIn: Writable<boolean> = writable(false);

/* file-based persistent storage */
type TemplatesStorage = {
    templates: StudioPayload[],
    videoEdits: StudioPayload[],
}
const configFileNames = {
    templates: "biliup/templates.json",
}

export let allTemplates: Writable<StudioPayload[]> = writable([]);
export let allVideoEdits: Writable<StudioPayload[]> = writable([]);

export async function reloadTemplatesAndEdits() {
    if (!(await exists(configFileNames.templates, {baseDir: BaseDirectory.Config}))) {
        console.log(`${configFileNames.templates} does not exist, creating...`);
        addNotification({msg: "默认模板文件不存在，创建中", type: NotificationPopMode.INFO}, false);
        try {
            let emptyTemplatesStorage: TemplatesStorage = {
                templates: [],
                videoEdits: [],
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
        
        allTemplates.set(templatesFileJSON.templates);
        allVideoEdits.set(templatesFileJSON.videoEdits);
    } catch (e) {
        console.error("reloadTemplatesAndEdits()", e);
        addNotification({msg: `模板文件读取失败: ${e}`, type: NotificationPopMode.ERROR}, true);
    }
}

export async function saveTemplatesAndEdits() {
    let templatesStorage: TemplatesStorage = {
        templates: get(allTemplates),
        videoEdits: get(allVideoEdits),
    }
    
    let templatesStorageJSON = JSON.stringify(templatesStorage);
    try {
        await writeTextFile(configFileNames.templates, templatesStorageJSON, {baseDir: BaseDirectory.Config});
    } catch (e){
        console.error("saveTemplatesAndEdits()", e);
        addNotification({msg: `模板文件写入失败: ${e}`, type: NotificationPopMode.ERROR}, true);
    }
}
