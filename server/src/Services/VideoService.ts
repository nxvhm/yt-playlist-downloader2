import { Server } from 'socket.io';
import fs, { PathLike } from 'fs';
import ffmpeg from 'fluent-ffmpeg';

export default class VideoService {
    /**
     * 
     * @param socket Instance of the websocket server
     * @param clientId The ID of the connection(client) for which we do conversion 
     * @param source The filepath of the downloaded file which we're about to convert
     * @param output The fillepath of the converted file that is going to be outputed
     * @param cb This function will be executed once the conversion if finished
     * @returns {Function}
     */
    static mp3Convert = (
        socket: Server, 
        clientId: string, 
        source: PathLike, 
        output: PathLike, 
        cb: (success: Number, error?: String) => void
    ) => {
        return () => {
            // Send message that downaload progress had ended
            socket.to(clientId).emit('dl-progress', {
                ended: true
            });
            console.log('src:', source);
            let downloadedAudioStream = fs.createReadStream(source),
                convertedAudioStream  = fs.createWriteStream(output),
                totalTime = 0;

            ffmpeg(downloadedAudioStream)
            .on('codecData', data => {
                totalTime = parseInt(data.duration.replace(/:/g, '')) 
             })
            .on('progress', info => {
                // NOTE: Do manual calculation since the progress field is not always available on the info param
                // Calculate the progress 
                const time: number = parseInt(info.timemark.replace(/:/g, ''));
                const percent: number = Math.ceil((time / totalTime) * 100);
                // Send message to the client with the convertion progress
                socket.to(clientId).emit('convertion-progress', {
                    percents: percent,
                    ended: percent >= 100 ? true : false
                });
            })
            .on('end', function() {
                downloadedAudioStream.close();
                convertedAudioStream.close();
                fs.unlink(source, () => {});
                cb(1);
            })
            .on('error', function(err) {
                cb(0, err.message);
            })
            .format('mp3')
            .pipe(convertedAudioStream)
        
        }
    }
}