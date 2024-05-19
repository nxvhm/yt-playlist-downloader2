import {videoFormat} from '@distube/ytdl-core'

export type VideoDataType = {
	videoId: string,
	title: string,
	formats: videoFormat[],
	thumbnail: string,
	description: string
}

export type ProgressMessageType = {
	progress: number,
	action: string,
	label?: string
}

export type VideoCardPropsType = {
	data: VideoDataType,
	downloadUrl: string,
	mp3DownloadRequest: () => void,
	selectFormat: (bitRate: number) => void,
	mp3Convert: boolean,
	toggleMP3Convert:  (e: React.ChangeEvent<HTMLInputElement>) => void,
	audioBitrate: number | undefined
}

export type downloadRequestType = {
	mp3Convert: boolean,
	url: string
}
