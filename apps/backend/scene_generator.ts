import type { Role } from "@mistralai/mistralai/models/components";
import { client } from "./client";
import { SYSTEM_SCENE_PROMPT } from "./constants/prompts/scene_prompt";
import { createFileAndWrite, storeVoice } from "./fs/fs";
import { generateSpeech } from "./voice";
import { renderScene } from "./scene/render";

export class SceneGenerator {
    private transcriptions: string[] = [];
    private videoId: string;
    private MAX_ITERATION = 5;
    constructor(transcriptions: string[], videoId: string) {
        this.transcriptions = transcriptions;
        this.videoId = videoId;
    }
    async generate_manim_code(transcription: string, scene_id: string) {
        const messages = [
            { role: "system" as Role, content: SYSTEM_SCENE_PROMPT },
            { role: "user" as Role, content: transcription }
        ]
        for (let i = 0; i < this.MAX_ITERATION; i++) {
            try {
                const res = await client.chat.complete({
                    model: "mistral-medium-2505",
                    messages: messages
                })
                const output = res.choices[0].message.content as string;
                const cleanedOutput = output.replace(/```python\n?/g, '').replace(/```\n?/g, '');
                messages.push({ role: "assistant" as Role, content: cleanedOutput as string });
                createFileAndWrite(this.videoId, scene_id, cleanedOutput);
                renderScene(this.videoId, scene_id);
                return;
            } catch (error) {
                console.log(error);
                i += 1;
                // messages.push({ role: "user" as Role, content: "" })
            }
        }
    }
    async generate_speech(transcription: string, scene_id: string) {
        const voice = await generateSpeech(transcription);
        await storeVoice(this.videoId, scene_id, voice);
    }
    async generate_all_scenes() {
        this.transcriptions.forEach(async (transcription, idx) => {
            await this.generate_manim_code(transcription, String(idx));
            // await this.generate_speech(transcription,String(idx));
        })
    }
}