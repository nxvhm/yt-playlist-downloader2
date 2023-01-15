import { Socket } from "socket.io";
import { PathLike } from 'fs';

type DownloadProgressMsg = {
    clientId: string,
    msg: {
        percents: number,
        downloaded: number,
        total: number,
        remainig: number,
        ended: boolean,
        videoId: string
    } 
}

type ConversionProgressMessage = {
    clientId: string,
    msg: {
        percents: number,
        videoId: string,
        ended: boolean,
        path: boolean | PathLike
    }
}

class Messagenger {

    public static downloadProgressMessageHandler(socket: Socket, data: DownloadProgressMsg): void {

        /**
         * Example authentication. If name/token etc. 
         * missmatch dont emit anything to the client 
         * */ 
        let auth = socket?.handshake.auth;
        
        if (!auth || !auth.name || (auth.name && auth.name != 'ytdl-queue-worker')) {
            return;
        }
        
        socket.to(data?.clientId).emit('dl-progress', {
            videoId: data.msg.videoId,
            percents: data.msg.percents
        });
    }

    public static convertionProgressMessageHandler(socket: Socket, data: ConversionProgressMessage): void {

        /**
         * Example authentication. If name/token etc. 
         * missmatch dont emit anything to the client 
         * */ 
        let auth = socket.handshake.auth;
        
        if (!auth || !auth.name || (auth.name && auth.name != 'ytdl-queue-worker')) {
            return;
        }
        
        socket.to(data.clientId).emit('convertion-progress', data.msg);
        console.log("convertion-progress", data);
    }
}


export default Messagenger;
