import ytdl from 'ytdl-core'
import fs, { PathLike } from 'fs';
import {Response, Request} from 'express';
import { Server } from 'socket.io';
import { body, validationResult } from 'express-validator';

// import url from 'node:url';
import Queue from 'bull';

/**
 * Get video data (title, thumbnail, etc) if valid url provided
 */
export const GetVideoInfo = (req: Request, res: Response) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }

    let url = req.body.url;

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

        const videoQueue = new Queue(String(process.env.QUEUE_NAME), {
            redis: { port: 6379, host: 'redis'} 
        })

        videoQueue.add({id: req.body.url, clientId: req.body.clientId});
        
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