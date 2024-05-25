import {type Writable, writable} from "svelte/store";
import {BaseDirectory, exists, create as createFile, readTextFile} from "@tauri-apps/plugin-fs";

import type {StudioPayload} from "./type";

/* global state */
export let isLoggedIn: Writable<boolean> = writable(false);

/* file-based persistent storage */
type TemplatesStorage = {
    templates: StudioPayload[],
    videoEdits: StudioPayload[],
}
const configFileNames = {
    templates: "templates.json",
    videoEdits: "videos.json",
}

export let allTemplates: Writable<StudioPayload[]> = writable([]);
export let allVideoEdits: Writable<StudioPayload[]> = writable([]);

export async function reloadTemplatesAndEdits() {
    if (!(await exists(configFileNames.templates, {baseDir: BaseDirectory.Config}))) {
        console.log(`${configFileNames.templates} does not exist, creating...`);
        let templatesFileCreationResult = await createFile(configFileNames.templates, {baseDir: BaseDirectory.Config});
        console.log("templatesFileCreationResult", templatesFileCreationResult);
    }
    
    if (!(await exists(configFileNames.videoEdits, {baseDir: BaseDirectory.Config}))) {
        console.log(`${configFileNames.videoEdits} does not exist, creating...`);
        let videoEditsFileCreationResult = await createFile(configFileNames.videoEdits, {baseDir: BaseDirectory.Config});
        console.log("videoEditsFileCreationResult", videoEditsFileCreationResult);
    }
    
    try {
        let templatesFile = await readTextFile(configFileNames.templates, {baseDir: BaseDirectory.Config});
        let videoEditsFile = await readTextFile(configFileNames.videoEdits, {baseDir: BaseDirectory.Config});
        
        let templates: StudioPayload[] = JSON.parse(templatesFile);
        let videoEdits: StudioPayload[] = JSON.parse(videoEditsFile);
        
        allTemplates.set(templates);
        allVideoEdits.set(videoEdits);
    } catch (e) {
        console.error("reloadTemplatesAndEdits()", e);
    }
}
