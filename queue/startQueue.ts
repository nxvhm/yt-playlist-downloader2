import 'dotenv/config' 
import Queue from 'bull';

const queue = new Queue(process.env.QUEUE_NAME, { 
    redis: { 
        port: process.env.REDIS_PORT, 
        host: process.env.REDIS_HOST
    } 
});

queue.on('completed', job => {
    console.log(job.data);
    console.log(`Job with id ${job.id} has been completed`);
    console.log('Video '+job.data.videoId+" is ready");
})

queue.on('failed', (job, error) => {
    console.log("Failed: Job-" + job.id);
    console.error('FailedJon errorMessage', error);
});

// You can use concurrency as well: 
queue.process(5, '/home/node/bullqueue/processor.ts');
console.log('YT Download & Convert queue started');