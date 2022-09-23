import axios from './axios';
import socket from './socket';

export function getVideoData(url) {
    console.log(url);
    const p = new Promise((resolve, reject) => {
        axios.post('/get-info', {url,clientId: socket.id})
        .then(res => {
            console.log(res.data);
            res.status === 200 && res.data.err === 0 ? resolve(res.data.data) : reject(res.data.msg);
        })
    });

    return p;
}

export function downloadMP3(url) {
    const p = new Promise((resolve, reject) => {
        axios.post('/download-mp3', {url, clientId: socket.id})
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