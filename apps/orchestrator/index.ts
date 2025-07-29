import express from "express";
import Docker from "dockerode";
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
        const container = await docker.createContainer({
            Image: "p2v-backend",
            ExposedPorts: {
                "3001/tcp": {},
            },
            HostConfig: {
                PortBindings: {
                    "3001/tcp": [{hostPort : ""}]
                }
            }
        });
        await container.start();
        const info = await container.inspect();
        const hostPort = info.NetworkSettings.Ports["3001/tcp"][0].HostPort;
        res.json({
            port: hostPort
        })
    } catch (error) {
        console.log(error);
    }
})

app.listen(3002);   