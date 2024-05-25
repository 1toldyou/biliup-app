import {invoke} from '@tauri-apps/api/core';
import type {BilibiliAPIResponse} from "./type";

const INVOKE_COMMANDS = {
    log: "log",
    loginByCookie: "login_by_cookie",
    loginByCookieFile: "login_by_cookie_file",
    getMyInfo: "get_myinfo",
    getOthersMyInfo: "get_others_myinfo",
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
}
