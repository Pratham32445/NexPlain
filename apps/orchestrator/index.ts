import express from "express";
import Docker from "dockerode";
import prismaClient from "db/client";
import cors from "cors";

const app = express();
const docker = new Docker({
    host: 'localhost',
    port: 2375
});

app.use(express.json());
app.use(cors());

app.post("/get-container-url", async (req, res) => {
    try {
        const checkContainerInfo = await docker.listContainers({ all: false });
        if (checkContainerInfo.length > 15) {
            res.status(401).json({
                message: "We have a huge of request at this time can you try after sometime"
            })
            return;
        }
        const project = await prismaClient.project.create({
            data: {
                userId: "26968528-016d-48c2-bb8f-66eb45b0524b"
            }
        })
        const container = await docker.createContainer({
            Image: "p2v-backend",
            ExposedPorts: {
                "3001/tcp": {},
            },
            HostConfig: {
                PortBindings: {
                    "3001/tcp": [{ hostPort: "" }]
                }
            }
        });
        await container.start();
        const info = await container.inspect();
        const hostPort = info.NetworkSettings.Ports["3001/tcp"][0].HostPort;
        res.json({
            port: hostPort,
            projectId: project.id
        })
    } catch (error) {
        console.log(error);
    }
})

app.listen(3002);   