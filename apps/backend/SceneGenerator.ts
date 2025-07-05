import type { Role } from "@mistralai/mistralai/models/components";
import { client } from "./client";
import { SYSTEM_SCENE_PROMPT } from "./constants/prompt/scene_prompt";
import { createLocation } from "./fs/fs";

const generated__video_path = "generated-videos";

export class SceneGenerator {
  private scene_transcription: string[] = [];
  private MAX_ITERATION = 5;
  private videoId: string;
  constructor(scene_transcription: string[], videoId: string) {
    this.scene_transcription = scene_transcription;
    this.videoId = videoId;
  }
  async generate_manim(Idx: number, videoId: string) {
    const transcription = this.scene_transcription[Idx];
    const messages = [
      {
        role: "system" as Role,
        content: SYSTEM_SCENE_PROMPT,
      },
      {
        role: "user" as Role,
        content: transcription,
      },
    ];
    const response = await client.chat.complete({
      model: "mistral-medium-2505",
      messages: messages,
    });
    let output = response.choices[0].message.content! as string;
    output = output.replace(/^`+|`+$/g, "");
    console.log(output);
    // messages.push({ role: "assistant" as Role, content: output as string });
    // const path = `${generated__video_path}/${this.videoId}/${Idx}/scene.py`;
    // createLocation(path);
  }
  generate_all_scenes() {
    for (let scene of this.scene_transcription) {
    }
  }
}
