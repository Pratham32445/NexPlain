import Redis from "ioredis";
import Docker from "dockerode";

const redisClient = new Redis(process.env.REDIS_URI!);
const docker = new Docker({ host: 'localhost', port: 2375 });


async function init() {
    while (true) {
        try {
            const res = await redisClient.brpop("promptQueue", 0);
            console.log(res);
            if (res) {
                const [queueName, data] = res;
                try {
                    const parsedData = JSON.parse(data);
                    const projectId = parsedData.projectId;
                    const videoId = parsedData.videoId;
                    startContainer(projectId, videoId);
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

async function startContainer(projectId: string, videoId: string) {
    try {
        const container = await docker.createContainer({
            Image: "runner",
            name: `container-${projectId}-${videoId}`,
            Tty: true,
            Env: [
                `PROJECT_ID=${projectId}`,
                `VIDEO_ID=${videoId}`
            ],
            HostConfig: {
                AutoRemove: false,
                NetworkMode: "bridge"
            }
        })
        await container.start();
        console.log("started...");
    } catch (error) {
        console.error(error);
    }
}



init();