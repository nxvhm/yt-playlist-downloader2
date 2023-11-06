import ytdl from 'ytdl-core'
import {Response, Request} from 'express';
import { Server } from 'socket.io';
import { body, validationResult } from 'express-validator';
import Queue from 'bull';
import VideoInfo from '../models/VideoInfo';

/**
 * Get video data (title, thumbnail, etc) if valid url provided
 */
export const GetVideoInfo = (req: Request, res: Response) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }

    const url = req.body.url;

    ytdl.getInfo(url).then(info => {
        const videoInfo = new VideoInfo(info);
        return res.send({success:1, err: 0, data: {
            title: videoInfo.getTitle(),
            thumbnail: info.videoDetails.thumbnails[3].url,
            formats: videoInfo.getAudioFormats(),
            videoId: videoInfo.videoId,
            description: videoInfo.getDescription()
        }})

    }).catch(err => {
        console.log('error during getBasicInfo');
        console.error(err);
        return res.send({success: 0, error: 1, msg: err.message});
    });
}
/**
 * Process incoming download request.
 * Create new donwload/convert job and send it to queue for processing
 */
export const DownloadMP3Audio = (wss: Server) => {
    return async (req: Request, res: Response) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors.array());
        }

        const videoQueue = new Queue(process.env.QUEUE_NAME || 'yt-dl-convert', {
            redis: { 
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379, 
            }
        })

        const videoId = ytdl.getURLVideoID(req.body.url);

        videoQueue.add({videoId, clientId: req.body.clientId});
        
        return res.status(200).json({
            success: 1
        });
    }
}

/**
 * Validator for youtube url to use for express routes
 */
export const VideoRequestValidator = [
    body('url').isURL(),
    body('url').custom(url => {
        
        if (!ytdl.validateURL(url)) {
            throw new Error('Invalid Youtube Video Url provided');            
        }
        return true;
    })
];