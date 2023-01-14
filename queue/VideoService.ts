import ytdl, { videoFormat } from 'ytdl-core'
import fs, { PathLike } from 'fs';
import url from 'node:url';
import SocketClient from "./SocketClient";
import { Socket } from 'socket.io-client';
import ffmpeg from 'fluent-ffmpeg';

type DownloadResultType = {
    downloaded: boolean, 
    filename: string,
    source: PathLike,
    path: PathLike 
}

class VideoService {
    /**
     * ID of the websocket connection whic dispatched the job
     */
    public clientId: string;
    /**
     * The url of the video we're about to convert/download
     */
    public videoUrl: string;
    /**
     * Instance of the socket client connection
     */
    public wssClient: Socket;
    /**
     * 
     * @param clientId 
     * @param videoUrl 
     */
    constructor(clientId:string, videoUrl: string) {
        this.clientId = clientId;
        this.videoUrl = videoUrl;
        this.wssClient = SocketClient.getClient();
    }
    /**
     * Get the highest quality audio format available for the video
     * @param formats 
     * @returns 
     */
    public getBestQualityFormat(formats: videoFormat[]): videoFormat | undefined {
        
        // The available audio formats for the video
        let audioFormats: Array<videoFormat> = ytdl.filterFormats(formats, 'audioonly');

        let bestQualityFormat: videoFormat | undefined;

        audioFormats.forEach(format => {

            if (bestQualityFormat == undefined) {
                bestQualityFormat = format;
            }
    
            if (format.audioBitrate && bestQualityFormat.audioBitrate && (format.audioBitrate > bestQualityFormat?.audioBitrate)) {
                bestQualityFormat = format;
            }
        });

        return bestQualityFormat;
    }
    /**
     * Download audio
     */
    public async downloadAudio(): Promise<DownloadResultType> {
        let p = new Promise<DownloadResultType>(async (resolve, reject) => {
            let info = await ytdl.getInfo(this.videoUrl);
        
            let bestAudioFormat = this.getBestQualityFormat(
                ytdl.filterFormats(info.formats, 'audioonly')
            );

            const video = ytdl(this.videoUrl, {
                filter: format => format.itag == bestAudioFormat?.itag
            });     
    
            let ext  = bestAudioFormat?.mimeType?.split(';')[0].split('/')[1],
                title = this.sanitizeTitle(info.videoDetails.title),
                starttime: number,    
                filename: string = title+'.'+ext,
                downloadDir: PathLike = `bullqueue/files/`,
                source: PathLike = downloadDir+filename,
                convertedFilename: string = title+'.mp3',
                destination: PathLike = downloadDir+convertedFilename;
    
            if (!fs.existsSync(downloadDir)) {
                fs.mkdirSync(downloadDir, {recursive: true});
            }
    
            // Start download the audio
            video.pipe(fs.createWriteStream(source));  
    
            video.once('response', () => {
                starttime = Date.now();
            });
    
            // On progress notify the client
            video.on('progress', (chunkLength, downloaded, total) => {
                this.notifyDownloadProgress(chunkLength, downloaded, total, starttime);
            }); 
    
            video.on('end', () => {
                resolve({
                    downloaded: true, 
                    filename: title+'.mp3', 
                    source,
                    path: destination,
                });
            });

            video.on('error', error => {
                reject(error);
            })
        });

        return p;
    }

    public sanitizeTitle(title: string) {
        return  title.replace(' ', '_').replace('/', '_').replace(/\s/g, '_').replace('|', '_');
    }

    private notifyDownloadProgress(chunkLength: number, downloaded: number, total: number, starttime: number) {
        const percent = downloaded / total;
        const downloadedMinutes:number = (Date.now() - starttime) / 1000 / 60;
        const estimatedDownloadTime: number = (downloadedMinutes / percent) - downloadedMinutes;

        let notificationMessage = {
            clientId: this.clientId,
            msg: {
                percents: (percent * 100).toFixed(2),
                downloaded: (downloaded / 1024 / 1024).toFixed(2),
                total: (total / 1024 / 1024).toFixed(2),
                remainig: estimatedDownloadTime.toFixed(2),
                ended: false,
                videoId: this.videoUrl
            }
        }
        
        this.wssClient?.emit('dl-progress', notificationMessage);
    }

    public mp3Convert(source: PathLike, output: PathLike): Promise<{
            success: boolean,
            error: boolean,
            path: PathLike,
    }> {

        const result = new Promise<{success: boolean,error: boolean,path: PathLike}>((resolve, reject) => {
            let downloadedAudioStream = fs.createReadStream(source),
                convertedAudioStream  = fs.createWriteStream(output),
                totalTime = 0;

            ffmpeg(downloadedAudioStream)
            .on('codecData', data => {
                totalTime = parseInt(data.duration.replace(/:/g, '')) 
             })
             .on('progress', info => {
                // NOTE: Do manu  al calculation since the progress field is not always available on the info param
                // Calculate the progress 
                const time: number = parseInt(info.timemark.replace(/:/g, ''));
                const percent: number = Math.ceil((time / totalTime) * 100);
    
                // Send message to the client with the convertion progress
                this.wssClient?.emit('convertion-progress', {
                    clientId: this.clientId,
                    msg: {
                        percents: percent,
                        ended: percent >= 100 ? true : false
                    }
                });
            })
            .on('end', function() {
                downloadedAudioStream.close();
                convertedAudioStream.close();
                fs.unlink(source, () => {});

                resolve({
                    success: true,
                    error: false,
                    path: output,
                });

            })
            .on('error', function(err) {
               reject({
                success:false, error: err 
               });
            })
            .format('mp3')
            .pipe(convertedAudioStream)                 
        })

        return result;
    }

}

export default VideoService