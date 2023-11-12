import 'dotenv/config' 
import { Job } from "bull";
import SocketClient from "./SocketClient";
import VideoService from "./VideoService";

const processor =  async function(job: Job ): Promise<Object> {
    console.log('processor was called with data:', job.data);

    const {videoId, mp3Convert, clientId} = job.data;
    const convertor = new VideoService(clientId, videoId);

    try {

        // Dowload audio
        let downloadedAudio = await convertor.downloadAudio();

        // Inform client that download is completed
        SocketClient.getClient()?.emit('dl-progress', {
            clientId,
            msg: {ended: true, videoId}
        })

        const resultMsg = {clientId, msg: {
            videoId,
            path: downloadedAudio.path
        }}

        // Convert downloaded audio if user requested
        if (mp3Convert) {
            let convertedAudio = await convertor.mp3Convert(downloadedAudio.source, downloadedAudio.path);
            resultMsg.msg.path = convertedAudio.path;
        }

        // Inform the client the conversion is completed
        SocketClient.getClient()?.emit('conversion-result', resultMsg)

        return Promise.resolve({result:'job-completed', videoId});

    } catch (error) {
        return Promise.reject(error);
    }
}

export default processor;