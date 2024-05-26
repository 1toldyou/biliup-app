import {get, type Writable, writable} from "svelte/store";
import {BaseDirectory, exists, readTextFile, writeTextFile} from "@tauri-apps/plugin-fs";

import {NotificationPopMode, type StudioPayload} from "./type";
import {addNotification} from "./notification.js";

// /* global state */
export let isLoggedIn: Writable<boolean> = writable(false);  // Cannot export state from a module if it is reassigned. Either export a function returning the state value or only mutate the state value's properties

export let allTemplates: Writable<{[category: string]: {[name: string]: StudioPayload}}> = writable({});
export let activeTemplates: Writable<{category: string, name: string, data: StudioPayload}[]> = writable([]);

/* file-based persistent storage */
type TemplatesStorage = {
    template: {[name: string]: StudioPayload},
    videoEdit: {[name: string]: StudioPayload},
}
const configFileNames = {
    templates: "biliup/templates.json",
}

export async function loadAllTemplates() {
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

export async function saveAllTemplates() {
    let templates = get(allTemplates);
    let templatesStorageJSON = JSON.stringify(templates);
    let templatesCount = 0;
    for (let category in templates) {
        templatesCount += Object.keys(templates[category]).length;
    }
    
    try {
        await writeTextFile(configFileNames.templates, templatesStorageJSON, {baseDir: BaseDirectory.Config});
    } catch (e){
        console.error("saveTemplatesAndEdits()", e);
        addNotification({msg: `模板文件写入失败: ${e}`, type: NotificationPopMode.ERROR}, true);
    } finally {
        addNotification({msg: `模板文件保存成功, 共计${templatesCount}个模板`, type: NotificationPopMode.INFO}, false);
    }
}

export function addToActiveTemplates(category: string, name: string, template: StudioPayload) {
    let activeTemplatesValue = get(activeTemplates);
    if (activeTemplatesValue.find((template) => template.category === category && template.name === name)){
        addNotification({msg: `模板 ${category}/${name} 已经在使用中`, type: NotificationPopMode.INFO}, true);
        return;
    }
    activeTemplates.update((value) => {
        value.push({category, name, data: template});
        return value;
    });
}

export function removeFromActiveTemplates(category: string, name: string) {
    activeTemplates.update((value) => {
        return value.filter((element) => element.category !== category || element.name !== name);
    });
}

export function saveActiveTemplate(category: string, name: string) {
    let activeTemplatesValue = get(activeTemplates);
    let template = activeTemplatesValue.find((template) => template.category === category && template.name === name);
    if (!template) {
        addNotification({msg: `模板 ${category}/${name} 不存在`, type: NotificationPopMode.INFO}, true);
        return;
    }
    
    let templates = get(allTemplates);
    templates[category][name] = structuredClone(template.data);
    allTemplates.set(templates);
}
