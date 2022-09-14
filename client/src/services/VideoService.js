import axios from './axios';
import socket from './socket';

export function getVideoData(url) {
    console.log(url);
    const p = new Promise((resolve, reject) => {
        axios.post('/get-info', {url,clientId: socket.id})
        .then(res => {
            res.status === 200 && res.data.err === 0 ? resolve(res.data.data) : reject(res.data.msg);
        })
    });

    return p;
}