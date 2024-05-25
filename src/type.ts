export type NotificationPopEntry = {
    type: string;
    msg: string;
    date: Date;
}

export enum NotificationPopMode {
    ERROR = "Error",
    INFO = "Info",
    WARNING = "Warning"
}
