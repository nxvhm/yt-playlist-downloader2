import 'dotenv/config' 
import { Request, Response } from 'express';
import Queue from 'bull';

export const downloadItems = async(req: Request, res: Response) => {
    console.log(req.body.ids);

    const videoQueue = new Queue(process.env.QUEUE_NAME || 'yt-dl-convert', {
        redis: { 
            host: process.env.QUEUE_NAME,
            port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379, 
        }
    })

    req.body.ids.forEach( (videoId: string) => {
        videoQueue.add({videoId, clientId: req.body.clientId});
    });

    return res.status(200).json({
        success: 1
    });
}

export const downloadVideosValidator = [

]
