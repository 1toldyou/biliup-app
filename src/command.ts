import {invoke} from "@tauri-apps/api/core";
import {listen} from "@tauri-apps/api/event";
import type {BilibiliAPIResponse, VideoPayload} from "./type";
import {activeTemplates} from "./store";

const INVOKE_COMMANDS = {
    log: "log",
    loginByCookie: "login_by_cookie",
    loginByCookieFile: "login_by_cookie_file",
    getMyInfo: "get_myinfo",
    getOthersMyInfo: "get_others_myinfo",
    archivePre: "archive_pre",
    coverUpload: "cover_up",
    uploadVideo: "upload_video_v2",
}

const LISTEN_EVENT_NAMES = {
    uploadProgressUpdate: "upload-progress-update",
    uploadSpeedUpdate: "upload-speed-update",
}

export const BackendCommands = {
    log: async (level: string, msg: string): Promise<void> => {
        await invoke(INVOKE_COMMANDS.log, {level, msg});
    },
    
    listAccounts: async (): Promise<string[]> => {
        return await invoke("list_accounts");
    },
    
    loginByCookieFile: async (cookieFile: string): Promise<string> => {
        return await invoke(INVOKE_COMMANDS.loginByCookieFile, {cookieFilename: cookieFile});
    },
    
    getMyInfo: async (): Promise<BilibiliAPIResponse<{mid: number, name: string, face: string}>> => {
        return await invoke(INVOKE_COMMANDS.getMyInfo);
    },
    
    archivePre: async (): Promise<BilibiliAPIResponse<ArchivePreResponse>> => {
        return await invoke(INVOKE_COMMANDS.archivePre);
    },
    
    coverUpload: async (buffer: ArrayBuffer): Promise<string> => {
        return await invoke(INVOKE_COMMANDS.coverUpload, {input: Array.prototype.slice.call(new Uint8Array(buffer))});
    },
    
    uploadVideo: async (video: VideoPayload, id: string): Promise<BilibiliAPIResponse<VideoPayload>> => {
        return await invoke(INVOKE_COMMANDS.uploadVideo, {video, id});
    }
}

type ArchivePreResponse = {
    activities: {
        act_url: string;
        bgm_id: number;
        bvids: string;
        child_sids: string;
        comment: string;
        cover: string;
        dic: string;
        etime: number;
        global_weight: number;
        h5_cover: string;
        hot: number;
        hot_value: number;
        id: number;
        name: string;
        new: number;
        oids: string;
        poster_id: number;
        priority_region: string;
        protocol: string;
        rank: string;
        region_weight: number;
        stime: number;
        tag_show_platform: number;
        tags: string;
        type: number;
        types: string;
    }[],
    typelist: {
        id: number,
        name: string,
        desc: string,
        children: {
            id: number,
            name: string,
            desc: string,
            intro_copy: string, // placeholder in description when copyright is reprinting
            intro_original: string, // placeholder in description when copyright is original
            notice: string, // kind of tip
        }[],
        max_video_count: number,
    }[],
    video_jam: {
        comment: string, // 预计审核完成时间
        level: number,
        state: string
    }
}

let commandCache: {[key: string]: any} = {};

// @ts-ignore
export async function cacheCommand<T extends (...args: any[]) => Promise<BilibiliAPIResponse<any>>>(fn: T, args: Parameters<T>[]): ReturnType<T> {
    let cacheKey = fn.name + JSON.stringify(args);
    if (commandCache[cacheKey]){
        console.debug("cache hit", cacheKey);
        return commandCache[cacheKey];
    }
    
    let resp = await fn(...args);
    if (resp.code === 0){
        console.debug("cache set", cacheKey)
        commandCache[cacheKey] = resp;
    }
    return resp as ReturnType<T>;
}

export function setupBackendEventListening(){
    console.log("setupBackendEventListening()");
    listen(LISTEN_EVENT_NAMES.uploadProgressUpdate, (event: {payload: any[]}) => {
        let [id, uploadedSize, totalSize] = event.payload;
        console.log("uploadProgressUpdate", id, uploadedSize, totalSize);
        let updated = false;
        activeTemplates.update((currentTemplates) => {
            currentTemplates.forEach(template => {
                template.data.files.forEach(file => {
                    if (file.id === id){
                        file.uploadedSize = uploadedSize;
                        file.totalSize = totalSize;
                        file.progress = uploadedSize / totalSize * 100;
                        if (Math.round(file.progress * 100) === 10000) file.completed = true;
                        updated = true;
                        // console.log("progress updated for", file.id, file.progress, file.completed);
                        // return currentTemplates;
                    }
                });
            });
            if (!updated) console.warn(`${LISTEN_EVENT_NAMES.uploadProgressUpdate} received but file not found`, event.payload[0]);
            return currentTemplates;
        });
    }).then(() => {
        console.log(`listen(${LISTEN_EVENT_NAMES.uploadProgressUpdate}) registered`);
    });
    
    listen(LISTEN_EVENT_NAMES.uploadSpeedUpdate, (event: {payload: any[]}) => {
        let [id, speed] = event.payload;
        console.log("uploadSpeedUpdate", id, speed);
        let updated = false;
        activeTemplates.update((currentTemplates) => {
            currentTemplates.forEach(template => {
                template.data.files.forEach(file => {
                    if (file.id === id){
                        const millis = Date.now() - file.startTimestamp;
                        file.speedUploaded += speed;
                        // console.log(`${file.speedUploaded} / 1000 / ${millis} = ${file.speedUploaded / 1000 / millis}`);
                        file.speed = file.speedUploaded / 1000 / millis;
                        updated = true;
                        // console.log("speed updated for", file.id, file.speed);
                        // return currentTemplates;
                    }
                });
            });
            if (!updated) console.warn(`${LISTEN_EVENT_NAMES.uploadSpeedUpdate} received but file not found`, event.payload[0]);
            return currentTemplates;
        });
    }).then(() => {
        console.log(`listen(${LISTEN_EVENT_NAMES.uploadSpeedUpdate}) registered`);
    });
    console.log("setupBackendEventListening() done");
}
