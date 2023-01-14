import { Job } from "bull";
import SocketClient from "./SocketClient";
import VideoService from "./VideoService";

const processor =  async function(job: Job ): Promise<Object> {
    console.log('processor was called with data:', job.data);
    const {id, clientId} = job.data;
    
    // SocketClient.getClient()?.emit('dl-progress', {progress: 12,clientId})

    let convertor = new VideoService(clientId, id);
    try {

        // Dowload audio
        let result = await convertor.downloadAudio();

        // Inform client that download is completed
        SocketClient.getClient()?.emit('dl-progress', {
            clientId,
            msg: {ended: true, videoId: id}
        })

        // Convert the downloaded audio
        let convertedAudio = await convertor.mp3Convert(result.source, result.path);

        // Inform the client the conversion is completed
        SocketClient.getClient()?.emit('conversion-result', {
            clientId,
            msg: {videoId: id, path: convertedAudio.path}
        })

        return Promise.resolve({result:'job-completed', videoId: id});

    } catch (error) {
        return Promise.reject(error);
    }
}

export default processor;