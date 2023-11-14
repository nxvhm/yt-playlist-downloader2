import 'dotenv/config' 
import { Job } from "bull";
import SocketClient from "./SocketClient";
import VideoService from "./VideoService";
import { WebSocketMessage, ProgressMessageType } from './types';
const processor =  async function(job: Job ): Promise<Object> {
    console.log('processor was called with data:', job.data);

    const {videoId, mp3Convert, clientId} = job.data;
    const convertor = new VideoService(clientId, videoId);

    try {

        // Dowload audio
        let downloadedAudio = await convertor.downloadAudio();

        // Inform client that download is completed
        const msg: WebSocketMessage = {
            clientId,
            msg: {
                percents: 100,
                completed: true,
                videoId: videoId,
                path: downloadedAudio.path.toString().replace('downloads/', '') 
            }
        }

        SocketClient.getClient()?.emit('dl-progress', msg)

        if (mp3Convert) {
            const convertedAudio = await convertor.mp3Convert(
                downloadedAudio.source, 
                downloadedAudio.path
            );
        }

        return Promise.resolve({result:'job-completed', videoId});

    } catch (error) {
        return Promise.reject(error);
    }
}

export default processor;