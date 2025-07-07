import type { Role } from "@mistralai/mistralai/models/components";
import { client } from "./client";
import { generate_transcript_pr } from "./constants/prompts/generate_transcripts_prompt";

export class TranscriptGenerator {
    static MAX_ITERATION = 5;
    private transcriptions: string[] = [];

    constructor() {

    }

    async generate_transcript(prompt: string) {
        const messages = [
            { role: "system" as Role, content: generate_transcript_pr },
            { role: "user" as Role, content: prompt }
        ]
        for (let i = 0; i < TranscriptGenerator.MAX_ITERATION; i++) {
            try {
                const res = await client.chat.complete({
                    model: "mistral-medium-2505",
                    messages: messages,
                    temperature: Math.round((i / TranscriptGenerator.MAX_ITERATION) * 10) / 10
                })
                let output = res.choices[0].message.content as string;
                return output;
            } catch (error) {
                messages.push({ "role": "user" as Role, "content": "Error: Did not follow correct format. Please create an array of strings for scenes." });
                i += 1;
            }
        }
    }


}