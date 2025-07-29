import type { Role } from "@mistralai/mistralai/models/components";
import { SYSTEM_SCENE_PROMPT } from "./constants/system_prompts/scene_prompt";
import { client } from "./LLM/client";
import { clipUnCompletedVideos, getFileContent, removeDir, removePartialFiles, StoreScene } from "./fs/fs";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { storeVideoToS3 } from "./s3/storage";
import { WebSocket } from "ws";
import { WS_EVENTS } from "comman/ws_event";
import { code_validation } from "./constants/system_prompts/code_validation";

export class SceneGenerator {
    private scene_transcriptions: string[] = [];
    private videoId: string;
    private MAX_TRANSCRIPTION = 5;
    private VideoLoader = 0;
    private MAX_RETRY_ATTEMPTS = 1;
    private scene_retry_count: Map<number, number> = new Map();
    private ws: WebSocket;
    private isProcessGoing: boolean;

    constructor(ws: WebSocket) {
        this.ws = ws;
        this.isProcessGoing = false;
        this.videoId = "";
    }

    async checkforProcess() {
        return this.isProcessGoing;
    }

    async loadingCount() {
        return this.VideoLoader; 
    }

    async render_scene(scene_id: number) {

        const INPUT_FILE_PATH = `/generated/${this.videoId}/scenes/${scene_id}.py`;
        const OUTPUT_FILE_PATH = `/generated/${this.videoId}/${scene_id}`;

        await removeDir(OUTPUT_FILE_PATH);

        const cmd = `manim render -qm ${INPUT_FILE_PATH} -o video --media_dir ${OUTPUT_FILE_PATH}`;

        exec(cmd, async (error, stdout, stderr) => {
            if (error) {
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
                let parsedCode = output;
                parsedCode = parsedCode.replace(/```python\s*\n?/g, "");
                parsedCode = parsedCode.replace(/```\s*$/g, "");
                parsedCode = parsedCode.replace(/^\s*STEP \d+.*$/gm, '');
                parsedCode = this.fixManimCode(parsedCode);
                parsedCode = parsedCode.trim();
                messages.push({ role: "system", content: parsedCode });
                StoreScene(this.videoId, Idx, parsedCode);
                this.render_scene(Idx);
                return;
            } catch (error) {
                messages.push({ "role": "user" as Role, "content": `Error ${error}` });
            }
        }
    }
    async generate_all_scenes(transcriptions: string[],videoId : string) {
        this.videoId = videoId;
        this.scene_transcriptions = transcriptions;
        this.isProcessGoing = true;
        const promises = transcriptions.map((transcription, idx) => {
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
            this.isProcessGoing = false;
        });
    }
    async checkForCompletion() {
        if (this.VideoLoader >= 100) {
            console.log("creating production video");
            await this.createProductionVideo();
        }
    }
    async validateCode(code: string) {
        const messages = [
            { "role": "system" as Role, "content": code_validation },
            { "role": "user" as Role, "content": code }
        ]
        const res = await client.chat.complete({
            messages: messages,
            model: "mistral-medium-2505"
        })
        const content = res.choices[0].message.content as string;
        const correctedCode = this.extractCorrectedCode(content);
        return correctedCode || code;
    }
    private extractCorrectedCode(response: string): string | null {
        const patterns = [
            /\*\*CORRECTED CODE:\*\*\s*```(?:python)?([\s\S]*?)```/,
            /CORRECTED CODE:\s*```(?:python)?([\s\S]*?)```/,
            /```python([\s\S]*?)```/,
            /```([\s\S]*?)```/
        ];

        for (const regex of patterns) {
            const match = response.match(regex);
            if (match && match[1]) {
                let code = match[1].trim();
                code = code.replace(/\*\*.*?\*\*/g, ''); 
                code = code.replace(/^\s*```.*$/gm, ''); 
                code = code.replace(/^\s*STEP \d+.*$/gm, ''); 
                code = code.replace(/^\s*Status:.*$/gm, ''); 
                code = code.replace(/^\s*\[Command.*$/gm, '');
                return code.trim();
            }
        }
        return null;
    }

    private fixManimCode(code: string): string {

        code = code.replace(/Code\(code=/g, 'Code(code_string=');
        code = code.replace(/Code\(\s*code=/g, 'Code(code_string=');

        code = code.replace(/,\s*font_size=[0-9]+/g, '');
        code = code.replace(/,\s*font="[^"]*"/g, '');
        code = code.replace(/,\s*font='[^']*'/g, '');

        code = code.replace(/\.submobjects\[\d+\]/g, '.get_center()');

        code = code.replace(/\.code_object\.get_lines\(\)/g, '');
        code = code.replace(/\.code_object/g, '');

        code = code.replace(/SurroundingRectangle\(\s*[^,]*\.submobjects\[[^\]]*\]/g,
            'Rectangle(width=3, height=0.4, color=YELLOW, fill_opacity=0.3)');

        code = code.replace(/\.next_to\(\w+\[\d+\],\s*\w+(?:,\s*buff=[0-9.]+)?\)/g, '');

        const vgroupPattern = /VGroup\([^)]*\w+\[\d+\][^)]*\)/g;
        if (vgroupPattern.test(code)) {
            code = code.replace(/^(\s*)(.*\w+\[\d+\].*)$/gm, '$1# $2  # Fixed: Circular reference removed');
        }

        code = code.replace(/color=BROWN/g, 'color="#8B4513"');
        code = code.replace(/color=BROWN,/g, 'color="#8B4513",');

        code = code.replace(/SVGMobject\(["']timer\.svg["']\)/g, 'Circle(radius=0.5, color=BLUE)');
        code = code.replace(/SVGMobject\(["'][^"']*\.svg["']\)/g, 'Rectangle(width=1, height=1, color=GRAY)');

        code = code.replace(/Diamond\(([^)]+)\)/g, (match, params) => {
            const widthMatch = params.match(/width=([0-9.]+)/);
            const heightMatch = params.match(/height=([0-9.]+)/);
            const colorMatch = params.match(/color=([A-Z_]+|"[^"]*"|'[^']*')/);
            const fillOpacityMatch = params.match(/fill_opacity=([0-9.]+)/);

            const width = widthMatch ? parseFloat(widthMatch[1]) : 2;
            const height = heightMatch ? parseFloat(heightMatch[1]) : 2;
            const color = colorMatch ? colorMatch[1] : 'WHITE';
            const fillOpacity = fillOpacityMatch ? fillOpacityMatch[1] : '0.2';

            const halfWidth = width / 2;
            const halfHeight = height / 2;

            return `Polygon([0, ${halfHeight}, 0], [${halfWidth}, 0, 0], [0, -${halfHeight}, 0], [-${halfWidth}, 0, 0], color=${color}, fill_opacity=${fillOpacity})`;
        });

        if (!code.includes('from manim import *')) {
            code = 'from manim import *\n\n' + code;
        }

        return code;
    }
}       