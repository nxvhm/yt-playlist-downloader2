import 'dotenv/config' 
import Queue from 'bull';

const queue = new Queue(process.env.QUEUE_NAME || 'yt-dl-convert', { 
    redis: { 
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379, 
    }
});

queue.on('completed', job => {
    console.log(job.data);
    console.log(`Job with id ${job.id} has been completed`);
    console.log('Video '+job.data.videoId+" is ready");
})

queue.on('failed', (job, error) => {
    console.log("Failed: Job-" + job.id);
    console.error('FailedJob errorMessage', error);
});

// You can use concurrency as well: 
queue.process(5, __dirname+'/processor');
console.log('YT Download & Convert queue started');