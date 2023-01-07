import Queue from 'bull';

const queue = new Queue('yt-dl-convert', { 
    redis: { port: 6379, host: 'redis'} 
});

queue.on('completed', job => {
    console.log(job.data);
    console.log(`Job with id ${job.id} has been completed`);
    console.log('Video '+job.data.id+" is ready");
}) 

// You can use concurrency as well: 
queue.process(5, '/home/node/bullqueue/processor.ts');
console.log('YT Download & Convert queue started');