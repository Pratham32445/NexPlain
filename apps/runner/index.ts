import {prismaClient} from "db/client";
import {Mistral} from "@mistralai/mistralai";

async function init() {
    const projectId = process.env.PROJECT_ID;
    const videoId = process.env.VIDEO_ID;
    const project = await prismaClient.project.findFirst({where : {
        Id : projectId
    }})
    
}