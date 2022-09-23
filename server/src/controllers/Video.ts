import ytdl, { videoFormat } from 'ytdl-core'
import fs, { PathLike } from 'fs';
import {Response, Request} from 'express';
import { Server } from 'socket.io';

export const GetVideoInfo = (req: Request, res: Response) => {
    let url = req.body.url;

    try {

        ytdl.getURLVideoID(url);

    } catch (error) {
        return res.send({success:0, err: 1, msg: 'Invalid youtube url'});
    }

    ytdl.getInfo(url).then(info => {

        return res.send({success:1, err: 0, data: {
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails[3].url,
            formats: info.formats
        }})

    }).catch(err => {
        console.log('error during getBasicInfo');
        console.error(err);
        return res.send({success: 0, error: 1, msg: err.message});
    });
}

export const DownloadVideoFromSelectedFormat = (wss: Server) => {
    return (req: Request, res: Response) => {

        let mimeType: string  = req.body.mimeType ?? 'audio/mp4';

        const video = ytdl(req.body.url, {
            filter: format => format.mimeType == req.body.mimeType
        });

        console.log(video);
        
    
        let ext  = req.body.mimeType.split(';')[0].split('/')[1],
          title: string  = req.body.title,
          client: string = req.body.clientId,
          starttime: number,    
          filename: string = title+'.'+ext,
          path: PathLike = `public/downloaded/${filename}`;
          
        video.pipe(fs.createWriteStream(path));    
    
        video.once('response', () => {
          starttime = Date.now();
        });
        
        video.on('progress', (chunkLength, downloaded, total) => {
    
            const percent = downloaded / total;
            const downloadedMinutes:number = (Date.now() - starttime) / 1000 / 60;
            const estimatedDownloadTime: number = (downloadedMinutes / percent) - downloadedMinutes;
    
            let progressMsg = {
              percents: (percent * 100).toFixed(2),
              downloaded: (downloaded / 1024 / 1024).toFixed(2),
              total: (total / 1024 / 1024).toFixed(2),
              remainig: estimatedDownloadTime.toFixed(2)
            }
            
            wss.to(client).emit('progress', progressMsg);
    
        });  
        
        video.on('end', () => {
          res.send({success:1, error: 0, filename});
        });
    }


}

export const DownloadMP3Audio = (wss: Server) => {
    return async (req: Request, res: Response) => {
        
        let info = await ytdl.getInfo(req.body.url);
    
        let bestQualityFormat: videoFormat | undefined,
            audioFormats: Array<videoFormat> = ytdl.filterFormats(info.formats, 'audioonly');

        audioFormats.forEach(format => {

            if (bestQualityFormat == undefined) {
                bestQualityFormat = format;
            }
    
            if (format.audioBitrate && bestQualityFormat.audioBitrate && (format.audioBitrate > bestQualityFormat?.audioBitrate)) {
                bestQualityFormat = format;
            }
        });

        const video = ytdl(req.body.url, {
            filter: format => format.itag == bestQualityFormat?.itag
        });        

        let ext  = bestQualityFormat?.mimeType?.split(';')[0].split('/')[1],
          title: string  = info.videoDetails.title.replace(' ', '_').replace('/', '_'),
          client: string = req.body.clientId,
          starttime: number,    
          filename: string = title+'.'+ext,
          downloadDir: PathLike = `public/downloaded/`,
          destination: PathLike = downloadDir+filename;

        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir, {recursive: true});
        }

        video.pipe(fs.createWriteStream(destination));    
    
        video.once('response', () => {
          starttime = Date.now();
        });
        
        video.on('progress', (chunkLength, downloaded, total) => {
    
            const percent = downloaded / total;
            const downloadedMinutes:number = (Date.now() - starttime) / 1000 / 60;
            const estimatedDownloadTime: number = (downloadedMinutes / percent) - downloadedMinutes;
    
            let progressMsg = {
              percents: (percent * 100).toFixed(2),
              downloaded: (downloaded / 1024 / 1024).toFixed(2),
              total: (total / 1024 / 1024).toFixed(2),
              remainig: estimatedDownloadTime.toFixed(2)
            }
            
            wss.to(client).emit('progress', progressMsg);
    
        });  
        
        video.on('end', () => {
          res.send({success:1, error: 0, filename});
        });
    }


}


export const DownloadTest = async (req: Request, res: Response) => {
    let url:string = 'https://www.youtube.com/watch?v=mgtu7u9PKkI'
    
    let info = await ytdl.getInfo('mgtu7u9PKkI');
    
    console.log(info);

    let bestQualityFormat: videoFormat | undefined,
        audioFormats: Array<videoFormat> = ytdl.filterFormats(info.formats, 'audioonly');
    
    audioFormats.forEach(format => {

        if (bestQualityFormat == undefined) {
            bestQualityFormat = format;
        }

        if (format.audioBitrate && bestQualityFormat.audioBitrate && (format.audioBitrate > bestQualityFormat?.audioBitrate)) {
            bestQualityFormat = format;
        }
    });

    console.log('highestQ:', bestQualityFormat);
}