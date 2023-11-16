import 'dotenv/config'
import ytdl, {videoFormat} from '@distube/ytdl-core';
import fs, { PathLike } from 'fs';
import SocketClient from "./SocketClient";
import { Socket } from 'socket.io-client';
import ffmpeg from 'fluent-ffmpeg';
import {sep as dirSeparator} from 'path'
import { DownloadResultType, ProgressMessageType, WebSocketMessage } from './types';


class VideoService {
    /**
     * ID of the websocket connection whic dispatched the job
     */
    public clientId: string;
    /**
     * The ID of the video we're about to convert/download
     */
    public videoId: string;
    /**
     * Instance of the socket client connection
     */
    public wssClient: Socket;
    /**
     *
     * @param clientId
     * @param videoId
     */
    constructor(clientId:string, videoId: string) {
        this.clientId = clientId;
        this.videoId = videoId;
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
            let info = await ytdl.getInfo(this.videoId);

            let bestAudioFormat = this.getBestQualityFormat(
                ytdl.filterFormats(info.formats, 'audioonly')
            );

            const video = ytdl(this.videoId, {
                filter: format => format.itag == bestAudioFormat?.itag
            });

            let ext  = bestAudioFormat?.mimeType?.split(';')[0].split('/')[1],
                title = this.sanitizeTitle(info.videoDetails.title),
                starttime: number,
                filename: string = title+'.'+ext,
                downloadDir: PathLike = String('downloads'+dirSeparator),
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

    /**
     * Send message over through ws containing dl progress data
     * @param chunkLength
     * @param downloaded
     * @param total
     * @param starttime
     * @return void
     */
    private notifyDownloadProgress(chunkLength: number, downloaded: number, total: number, starttime: number): void {
        const percent = downloaded / total;
        const downloadedMinutes:number = (Date.now() - starttime) / 1000 / 60;
        const estimatedDownloadTime: number = (downloadedMinutes / percent) - downloadedMinutes;

        let notificationMessage: WebSocketMessage = {
            clientId: this.clientId,
            msg : {
                percents: Number((percent * 100).toFixed(2)),
                completed: false,
                path: false,
                videoId: this.videoId
            }
        }

        this.wssClient?.emit('dl-progress', notificationMessage);
    }
    /**
     *
     * @param source The filepath of the downloaded file which we're about to convert
     * @param output The fillepath of the converted file that is going to be outputed
     * @returns {Promise}
     */
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

                let msg:ProgressMessageType = {
                    percents: percent,
                    videoId: this.videoId,
                    completed: percent >= 100 ? true : false,
                    path: false
                };

                if (msg.completed)
                    msg.path = output;

                // Send message to the client with the convertion progress
                this.wssClient?.emit('convertion-progress', {
                    clientId: this.clientId,
                    msg
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
