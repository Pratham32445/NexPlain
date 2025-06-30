import { AI } from "./AI/AIclient";
import { validationPrompt } from "./constants/prompts/ValidationPrompt";
import { app } from "./server";
import Redis from "ioredis";
import { prismaClient } from "db/client"

const redisClient = new Redis(process.env.REDIS_URI!);

app.post("/create-video", async (req, res) => {
    const { prompt, projectId } = req.body;
    if (!prompt || prompt.trim() == "") {
        res.status(401).json({
            error: "Please provide a prompt"
        })
        return;
    }
    const classification = await validatePrompt(prompt);
    if (classification.type != "MANIM_SUITABLE") {
        res.status(401).json({
            type: classification.type,
            reasoning: classification.reasoning,
            suggestion: classification.suggestion
        })
        return;
    }
    await prismaClient.project.update({
        where: {
            Id: projectId
        }, data: {
            userPrompt: {
                push: prompt
            }
        }
    })
    const video = await prismaClient.video.create({
        data: {
            projectId,
            prompt
        }
    })
    redisClient.lpush("promptQueue", JSON.stringify({ projectId, videoId: video.Id }));
    res.status(201).json("Done");
})

async function validatePrompt(prompt: string): Promise<{
    type: string,
    reasoning: string,
    suggestion: string,
}> {
    const chatResponse = await AI.chat.complete({
        model: "mistral-tiny",
        messages: [
            {
                role: "system",
                content: validationPrompt
            },
            {
                role: "user",
                content: `Please classify this video request: "${prompt}"`
            }
        ]
    })
    const aiResponse = chatResponse.choices[0].message.content as string;
    return parseClassification(aiResponse);
}

function parseClassification(response: string) {
    const lines = response.split("\n");

    const classification = {
        type: "UNKNOWN",
        reasoning: "",
        suggestion: "",
    };

    lines.forEach((line) => {
        const trimmed = line.trim()
        if (trimmed.startsWith("Classification:")) {
            const match = trimmed.match(/Classification:\s*(MANIM_SUITABLE|MANIM_UNSUITABLE|MANIM_PARTIAL)/);
            if (match) classification.type = match[1];
        } else if (trimmed.startsWith("Reasoning:")) {
            classification.reasoning = trimmed.replace("Reasoning:", "").trim();
        } else if (trimmed.startsWith("Suggestion:")) {
            classification.suggestion = trimmed.replace("Suggestion:", "").trim();
        }
    });
    return classification;
}