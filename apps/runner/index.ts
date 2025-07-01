import { prismaClient } from "db/client";
import { Mistral } from "@mistralai/mistralai";
import { systemPrompt } from "./constants/prompts/SystemPrompt";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

async function init() {
    const projectId = process.env.PROJECT_ID!;
    const videoId = process.env.VIDEO_ID!;
    const project = await prismaClient.project.findFirst({
        where: {
            Id: projectId
        }
    })
    const code = await generateCode(project?.userPrompt!) as string;
    await createFile(code as string);
    const sceneName = code.match(/class\s+(\w+)\s*\(\s*Scene\s*\)/);
    if (sceneName) {
        await GenerateVideo(sceneName[1],videoId);
    }
}

async function generateCode(prompts: string[]) {
    try {
        const AI = new Mistral({ apiKey: process.env.MISTRAL_API_KEY })
        const res = await AI.chat.complete({
            model: "mistral-medium-2505",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                ...prompts.map((prompt) => ({
                    role: "user" as const,
                    content: prompt
                }))
            ]
        })
        return res.choices[0].message.content;
    } catch (error) {
        console.log(error);
    }
}

async function createFile(code: string) {
    const outputPath = path.join(process.cwd(), "main.py");
    fs.writeFileSync(outputPath, code);
}

async function GenerateVideo(sceneName: string, videoId: string) {
    const filePath = path.join(process.cwd(), "main.py");
    return new Promise((resolve, reject) => {
        const cmd = `manim ${filePath} ${sceneName} -o video.mp4 -qk`;
        exec(cmd, async (error, stdout, stderr) => {
            if (error) {
                return reject(error)
            }
            await prismaClient.video.update({
                where: {
                    Id: videoId
                },
                data: {
                    status: "GENERATED"
                }
            })
            resolve("Done");
        })
    })
}

init();