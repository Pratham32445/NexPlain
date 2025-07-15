import type { Role } from "@mistralai/mistralai/models/components";
import { transcript_generator } from "./constants/system_prompts/transcript_generator";
import { client } from "./LLM/client";

export class TranscriptGenerator {
    public MAX_ITERATION = 5;

    async generate_transcript(prompt: string) {
        const messages = [
            { "role": "system" as Role, "content": transcript_generator },
            { "role": "user" as Role, "content": prompt }
        ]

        for (let i = 0; i < this.MAX_ITERATION; i++) {
            try {
                const response = await client.chat.complete({
                    messages: messages,
                    model: "mistral-medium-2505"
                })
                const res = response.choices[0].message.content as string;
                return res;
            } catch (error) {
                messages.push({ "role": "user" as Role, "content": "Error: Did not follow correct format. Please create an array of strings for scenes."})
            }
        }
    }
}