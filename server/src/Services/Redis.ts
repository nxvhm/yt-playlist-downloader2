import { createClient, ErrorReply } from 'redis';
import 'dotenv/config' 

const redisClient = createClient({
    socket: {
        port: Number(process.env.REDIS_PORT),
        host: 'redis',
        reconnectStrategy: retries => {
            if (retries >= 5) {
                return new ErrorReply("Max retries reached:"+retries);
            }
            return retries;
        }
    }
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));

export const getRedisClient = async () => {
    await redisClient.connect();
    return redisClient;
}
   