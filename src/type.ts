/* types of variables */
export type NotificationPopEntry = {
    type: NotificationPopMode;
    msg: string;
    date: Date;
}

export enum NotificationPopMode {
    ERROR = "Error",
    INFO = "Info",
    WARNING = "Warning"
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

export type BiliupConfigOriginal = {
    limit: number,
    line: string,
    streamers: {
        [key: string]: {
            aid: number,
            copyright: number,
            cover: string,
            desc: string,
            desc_format_id: number,
            dolby: number,
            dtime: any,
            dynamic: string,
            interactive: number,
            lossless_music: number,
            mission_id: number,
            no_reprint: number,
            open_elec: boolean | null,
            open_subtitle: string,
            source: string,
            subtitle: {lan: string, open: number}
            tag: string,
            tid: number,
            title: string
            up_close_danmu: boolean,
            up_close_reply: boolean,
            up_selection_reply: boolean,
        }
    },
    user: any,
    checkInputsBeforeSubmit: boolean,
}

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
}

type CreditPayload = {
    open: number,
    lan: string,
};

type SubtitlePayload = {
    type_id: number,
    raw_text: string,
    biz_id: string | null,
};

type VideoPayload = {
    title: string | null,
    filename: string,
    desc: string,
};
