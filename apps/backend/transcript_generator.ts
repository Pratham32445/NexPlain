import type { Role } from "@mistralai/mistralai/models/components";
import { client } from "./client";
import { transcript_prompt } from "./constants/prompt/transcript";

export class TranscriptGenerator {
  private MAX_ITERATIONS = 5;
  private scene_transcriptions = [];

  constructor() {
    this.scene_transcriptions = [];
  }

  populateTranscriptionsArray(transcriptions: string): void {
    const fixed = transcriptions.replace(/"([^"]*)"/gs, (match) =>
      match.replace(/\r?\n/g, "\\n")
    );
    try {
      this.scene_transcriptions = JSON.parse(fixed);
    } catch (e) {
      console.error("Failed to parse transcriptions:", e);
      this.scene_transcriptions = [];
    }
  }

  async generate_transcript(prompt: string, emotion: string) {
    const system_prompt = transcript_prompt.replace("{emotions}", emotion);
    const messages = [
      { role: "system" as Role, content: system_prompt },
      { role: "user" as Role, content: prompt },
    ];
    for (let i = 0; i < this.MAX_ITERATIONS; i++) {
      const response = await client.chat.complete({
        model: "mistral-medium-2505",
        messages: messages,
        temperature: Math.round((i / 5) * 10) / 10,
      });
      const output = (response.choices[0].message.content! as string)
        .trim()
        .replace(/^python/, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();
      this.populateTranscriptionsArray(output);
      return this.scene_transcriptions;
    }
  }
}
