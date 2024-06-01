/* types of variables */
export type NotificationPopEntry = {
    type: NotificationPopMode;
    msg: string;
    date: Date;
}

export enum NotificationPopMode {
    ERROR = "Error",
    INFO = "Info",
}

export type SelectedTemplate = {
    title: string,
    copyright: number,
    source: string,
    tid: number,
    desc: string,
    dynamic: string,
    files: {
        complete: boolean,
        desc: string,
        filename: string,
        id: string,
        process: boolean,
        progress: number,
        speed: number,
        speed_uploaded: number,
        title: string,
        totalSize: number,
        uploaded: number,
    }[],
    [key: string]: any;
};

export type BilibiliAPIResponse<T> = {code: number, message: string, data: T}

/* types for using invoke()  */
export type StudioPayload = {
    copyright: number,
    source: string,
    tid: number,
    cover: string,
    title: string,
    desc_format_id: number,
    desc: string,
    desc_v2: CreditPayload[] | null,
    dynamic: string,
    subtitle: SubtitlePayload,
    tag: string,
    videos: VideoPayload[],
    dtime: number | null,
    open_subtitle: boolean,
    interactive: number,
    mission_id: number | null,
    dolby: number,
    lossless_music: number,
    no_reprint: number,
    open_elec: number,
    aid: number | null,
    up_selection_reply: boolean,
    up_close_reply: boolean,
    up_close_danmu: boolean,
};

export type StudioExtra = {
    files: {
        id: string, // something unique that can be used to distinguish the file when multiple templates are uploading the same file
        filename: string,
        absolutePath: string,
        size: number,
        title: string,
        desc: string,
        completed: boolean,
        speed: number,
        progress: number,
        uploadedSize: number,
        totalSize: number,
        speedUploaded: number, // don't know what this is
        startTimestamp: number,
        started: boolean,
    }[],
}

type CreditPayload = {
    type_id: number,
    raw_text: string,
    biz_id: string | null,
};

type SubtitlePayload = {
    open: number,
    lan: string,
};

export type VideoPayload = {
    title: string | null,
    filename: string, // the filename used by bilibili internally, not the filename on disk
    desc: string,
};
