import fs, { PathLike } from 'fs';

export type DownloadResultType = {
    downloaded: boolean,
    filename: string,
    source: PathLike,
    path: PathLike,
    extension?: string | undefined
}

export type ProgressMessageType = {
    percents: number,
    videoId: string,
    completed: boolean,
    path: boolean | PathLike
}

export type WebSocketMessage = {
    clientId: string,
    msg: ProgressMessageType
}