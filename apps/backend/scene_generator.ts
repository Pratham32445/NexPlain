import type { Role } from "@mistralai/mistralai/models/components";
import { client } from "./client";
import { SYSTEM_SCENE_PROMPT } from "./constants/prompts/scene_prompt";
import { createFileAndWrite, removePartialFiles, storeVoice } from "./fs/fs";
import { generateSpeech } from "./voice";
import { createProductionCut, renderScene, syncVideoAndAudio } from "./scene/render";

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
        ];
        let res;

        for (let i = 0; i < this.MAX_ITERATION; i++) {
            try {
                res = await client.chat.complete({
                    model: "mistral-medium-2505",
                    messages: messages
                });
                const output = res.choices[0].message.content as string;
                const cleanedOutput = output.replace(/```python\n?/g, '').replace(/```\n?/g, '');
                createFileAndWrite(this.videoId, scene_id, cleanedOutput);
                await renderScene(this.videoId, scene_id);
                removePartialFiles(this.videoId, scene_id);
                return;
            } catch (error) {
                if (i < this.MAX_ITERATION - 1) {
                    if (res?.choices?.[0]?.message?.content) {
                        const output = res.choices[0].message.content as string;
                        const cleanedOutput = output.replace(/```python\n?/g, '').replace(/```\n?/g, '');
                        messages.push({ role: "assistant" as Role, content: cleanedOutput });
                    }
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    messages.push({
                        role: "user" as Role,
                        content: `The previous code had an error: ${errorMessage}. Please fix the code and make sure all array indices are valid and the Manim syntax is correct.`
                    });
                } else {
                    console.error(`❌ Failed to generate scene ${scene_id} after ${this.MAX_ITERATION} attempts`);
                    throw error;
                }
            }
        }
    }

    async generate_speech(transcription: string, scene_id: string) {
        try {
            const voice = await generateSpeech(transcription);
            await storeVoice(this.videoId, scene_id, voice);
            console.log(`🔊 Speech generated for scene ${scene_id}`);
        } catch (error) {
            console.error(`❌ Error generating speech for scene ${scene_id}:`, error);
            throw error;
        }
    }

    async generate_all_scenes() {
        for (let idx = 0; idx < this.transcriptions.length; idx++) {
            const transcription = this.transcriptions[idx];
            const scene_id = String(idx);
            try {
                await this.generate_manim_code(transcription, scene_id);
                await this.generate_speech(transcription, scene_id);
                await syncVideoAndAudio(this.videoId, scene_id);
            } catch (error) {
                console.error(`❌ Failed to process scene ${scene_id}:`, error);
            }
        }
        createProductionCut(this.videoId);
    }
}       