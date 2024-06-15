import socket from "./socket";
import axios from "./axios";
import { VideoDataType, downloadRequestType } from "../definitions";

export function getVideoData(url: string): Promise<VideoDataType> {
    return new Promise((resolve, reject) => {
			axios.post('/get-info', {url,clientId: socket.id})
			.then(res => {
				console.log(res.data);
				res.status === 200 && res.data.err === 0 ? resolve(res.data.data) : reject(res.data.msg);
			}).catch(err => {
				reject(err.response.data);
			})
    });
}

export function downloadAudio(downloadRequest: downloadRequestType) {
    const p = new Promise((resolve, reject) => {
        axios.post('/download-audio', {...downloadRequest, clientId: socket.id})
            .then(res => {
                console.log('serverDownloadMP3Res:', res);
                if (res.status === 200) {
                    resolve(res);
                } else {
                    reject(res);
                }
            }).catch(res => {
                console.log(res);
            })
    });

    return p;
}

export function getPlaylistItems(playlist: string) {
    const p = new Promise((resolve, reject) => {
        axios.post('/playlist', {playlist}).then(res => {
            res.status === 200 ? resolve(res.data) : reject(res);
        }).catch(err => {
            reject(err.response.data);
        })
    });

    return p;
}

export function sendMultipleVideosForDownload(videoIds: string[]) {
    const p = new Promise((resolve, reject) => {
        axios.post('/playlist/download-items', {
            ids: videoIds,
            clientId: socket.id
        }).then(res => {
            res.status === 200 ? resolve(res.data) : reject(res);
        }).catch(err => {
            reject(err.response.data);
        })
    });

    return p;
}
