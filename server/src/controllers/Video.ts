import ytdl from 'ytdl-core'
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
        const video = ytdl(req.body.url, {
            filter: format => format.mimeType == req.body.mimeType
        });
    
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