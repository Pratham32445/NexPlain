import type { Role } from "@mistralai/mistralai/models/components";
import { SYSTEM_SCENE_PROMPT } from "./constants/system_prompts/scene_prompt";
import { client } from "./LLM/client";
import { StoreScene } from "./fs/fs";

export class SceneGenerator {
    private scene_transcriptions: string[] = [];
    private videoId: string;
    private MAX_TRANSCRIPTION = 5;

    constructor(scene_transcriptions: string[], videoId: string) {
        this.scene_transcriptions = scene_transcriptions;
        this.videoId = videoId;
    }

    render_scene() {
        
    }

    async generate_manim(Idx: number) {
        const transcript = this.scene_transcriptions[Idx];
        const messages = [
            { "role": "system" as Role, "content": SYSTEM_SCENE_PROMPT },
            { "role": "user" as Role, "content": transcript }
        ]
        for (let i = 0; i < this.MAX_TRANSCRIPTION; i++) {
            try {
                const res = await client.chat.complete({
                    messages: messages,
                    model: "mistral-medium-2505"
                })
                const output = res.choices[0].message.content as string;
                messages.push({ role: "system", content: output });
                StoreScene(this.videoId, Idx, output);
                return;
            } catch (error) {
                messages.push({ "role": "user" as Role, "content": `Error ${error}` });
            }
        }
    }
    generate_all_scenes() {
        this.scene_transcriptions.forEach((transcription, idx) => {
            this.generate_manim(idx);
        })
    }
}