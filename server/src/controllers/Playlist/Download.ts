import 'dotenv/config' 
import { Request, Response } from 'express';
import Queue from 'bull';

export const downloadItems = async(req: Request, res: Response) => {
    console.log(req.body.ids);

    const videoQueue = new Queue(String(process.env.QUEUE_NAME), {
        redis: { port: 6379, host: 'redis'} 
    })

    req.body.ids.forEach( (videoId: string) => {
        videoQueue.add({id: videoId});
    });

    return res.status(200).json({
        success: 1
    });
}

export const downloadVideosValidator = [

]
