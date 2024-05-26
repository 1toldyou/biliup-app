import {invoke} from '@tauri-apps/api/core';
import type {BilibiliAPIResponse} from "./type";

const INVOKE_COMMANDS = {
    log: "log",
    loginByCookie: "login_by_cookie",
    loginByCookieFile: "login_by_cookie_file",
    getMyInfo: "get_myinfo",
    getOthersMyInfo: "get_others_myinfo",
    archivePre: "archive_pre",
    coverUpload: "cover_up",
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
