import { Job } from "bull";
import SocketClient from "./SocketClient";

const processor =  function(job: Job ): Promise<Object> {
    console.log('processor was called with data:', job.data);

    const {videoId, clientId} = job.data;
    
    SocketClient.getClient()?.emit('dl-progress', {progress: 12,clientId})

    let result = {videoId, clientId};
    return Promise.resolve(result);
}

export default processor;