import Redis from "ioredis";
import { prismaClient } from "db/client"


const redisClient = new Redis(process.env.REDIS_URI!);

async function init() {
    while (true) {
        try {
            const res = await redisClient.brpop("promptQueue", 0);
            if (res) {
                const [queueName, data] = res;
                try {
                    const parsedData = JSON.parse(data);
                    const projectId = parsedData.projectId;
                    const videoId = parsedData.videoId;
                } catch (parseError) {
                    console.error("Failed to parse queue data:", parseError);
                }
            }
        } catch (error) {
            console.error("Redis connection error:", error);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}



init();