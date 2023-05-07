import 'dotenv/config' 
import { Request, Response } from 'express';
import Queue from 'bull';

export const downloadItems = async(req: Request, res: Response) => {
    console.log(req.body.ids);

    const videoQueue = new Queue(String(process.env.QUEUE_NAME), {
        redis: { 
            port: process.env.REDIS_PORT, 
            host: process.env.REDIS_HOST
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
