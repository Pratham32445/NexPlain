import type { Role } from "@mistralai/mistralai/models/components";
import { SYSTEM_SCENE_PROMPT } from "./constants/system_prompts/scene_prompt";
import { client } from "./LLM/client";
import { clearParitalFiles, clipUnCompletedVideos, getFileContent, removeDir, removePartialFiles, StoreScene } from "./fs/fs";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { storeVideoToS3 } from "./s3/storage";
import { WebSocket } from "ws";
import { WS_EVENTS } from "./EVENTS";

export class SceneGenerator {
    private scene_transcriptions: string[] = [];
    private videoId: string;
    private MAX_TRANSCRIPTION = 5;
    private VideoLoader = 0;
    private MAX_RETRY_ATTEMPTS = 1;
    private scene_retry_count: Map<number, number> = new Map();
    private ws: WebSocket;

    constructor(scene_transcriptions: string[], videoId: string, ws: WebSocket) {
        this.scene_transcriptions = scene_transcriptions;
        this.videoId = videoId;
        this.ws = ws;
    }

    async render_scene(scene_id: number) {

        const INPUT_FILE_PATH = `/generated/${this.videoId}/scenes/${scene_id}.py`;
        const OUTPUT_FILE_PATH = `/generated/${this.videoId}/${scene_id}`;

        await removeDir(OUTPUT_FILE_PATH);

        const cmd = `manim render -qm ${INPUT_FILE_PATH} -o video --media_dir ${OUTPUT_FILE_PATH}`;

        exec(cmd, async (error, stdout, stderr) => {
            if (error) {
                console.log(error);
                const currentRetryCount = this.scene_retry_count.get(scene_id) || 0;
                if (currentRetryCount < this.MAX_RETRY_ATTEMPTS) {
                    this.scene_retry_count.set(scene_id, currentRetryCount + 1);
                    const currentCode = getFileContent(this.videoId, scene_id);
                    await this.generate_manim(scene_id, {
                        error: `Rendering failed with error: ${error.message}\n\nStdout: ${stdout}\n\nStderr: ${stderr}`,
                        code: currentCode
                    }, "error");
                } else {
                    this.VideoLoader += 20;
                    clipUnCompletedVideos(scene_id, this.videoId);
                    this.checkForCompletion();
                }
                return;
            }
            if (stderr) {
                console.error(`Stderr for scene ${scene_id}: ${stderr}`);
            }
            this.VideoLoader += 20;
            await removePartialFiles(this.videoId, scene_id);
            this.checkForCompletion();
        });
    }

    async generate_manim(Idx: number, info = { error: "", code: "" }, type = "default") {
        const transcript = this.scene_transcriptions[Idx];
        const messages = [
            { "role": "system" as Role, "content": SYSTEM_SCENE_PROMPT },
            { "role": "user" as Role, "content": transcript }
        ]
        if (type == "error") {
            messages.push({ "role": "assistant" as Role, "content": info.code });
            messages.push({ "role": "assistant" as Role, "content": info.error });
        }
        for (let i = 0; i < this.MAX_TRANSCRIPTION; i++) {
            try {
                const res = await client.chat.complete({
                    messages: messages,
                    model: "mistral-medium-2505"
                })
                const output = res.choices[0].message.content as string;
                messages.push({ role: "system", content: output });

                StoreScene(this.videoId, Idx, output);
                this.render_scene(Idx);
                return;
            } catch (error) {
                messages.push({ "role": "user" as Role, "content": `Error ${error}` });
            }
        }
    }
    async generate_all_scenes() {
        const promises = this.scene_transcriptions.map((transcription, idx) => {
            this.generate_manim(idx);
        })
    }

    async createProductionVideo() {
        const videoListPath = path.join("/generated", this.videoId, "videos.txt");

        const videoPaths = this.scene_transcriptions.map((_, idx) => {
            const fullPath = path.join("/generated", this.videoId, `${idx}`, "videos", `${idx}`, "720p30", "video.mp4");
            return fullPath.replace(/\\/g, "/");
        });

        const fileContent = videoPaths.map(p => `file '${p}'`).join("\n");
        fs.writeFileSync(videoListPath, fileContent);

        const outputPath = path.join("/generated", this.videoId, "final_output.mp4");

        const cmd = `ffmpeg -f concat -safe 0 -i ${videoListPath.replace(/\\/g, "/")} -c:v libx264 -crf 18 -preset slow -c:a aac -b:a 128k ${outputPath.replace(/\\/g, "/")}`;

        exec(cmd, async (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ FFmpeg error: ${error.message}`);
                return;
            }
            await storeVideoToS3(this.videoId);
            this.ws.send(JSON.stringify({
                type: WS_EVENTS.VIDEO_GENERATED,
                payload: {
                    message: "Video Successfully Generated"
                }
            }))
            this.VideoLoader = 0;
        });
    }
    async checkForCompletion() {
        if (this.VideoLoader >= 100) {
            console.log("creating production video");
            await this.createProductionVideo();
        }
    }
}       