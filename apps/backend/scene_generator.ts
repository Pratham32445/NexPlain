import type { Role } from "@mistralai/mistralai/models/components";
import { SYSTEM_SCENE_PROMPT } from "./constants/system_prompts/scene_prompt";
import { client } from "./LLM/client";
import { clipUnCompletedVideos, getFileContent, removeDir, removePartialFiles, StoreScene } from "./fs/fs";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { storeVideoToS3 } from "./s3/storage";
import { WebSocket } from "ws";
import { WS_EVENTS } from "./EVENTS";
import { code_validation } from "./constants/system_prompts/code_validation";

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
        // Try multiple patterns to extract corrected code
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
                // Remove any validation artifacts
                code = code.replace(/\*\*.*?\*\*/g, ''); // Remove **SECTION:** headers
                code = code.replace(/^\s*```.*$/gm, ''); // Remove any remaining code block markers
                code = code.replace(/^\s*STEP \d+.*$/gm, ''); // Remove STEP headers
                code = code.replace(/^\s*Status:.*$/gm, ''); // Remove Status lines
                code = code.replace(/^\s*\[Command.*$/gm, ''); // Remove command lines
                return code.trim();
            }
        }
        return null;
    }

    private fixManimCode(code: string): string {
        // Fix common Manim errors

        // Fix 1: Code class parameter issues
        code = code.replace(/Code\(code=/g, 'Code(code_string=');
        code = code.replace(/Code\(\s*code=/g, 'Code(code_string=');

        // Fix 2: Remove unsupported font parameters from Code constructor  
        code = code.replace(/,\s*font_size=[0-9]+/g, '');
        code = code.replace(/,\s*font="[^"]*"/g, '');
        code = code.replace(/,\s*font='[^']*'/g, '');

        // Fix 3: Remove problematic code object access patterns
        code = code.replace(/\.submobjects\[\d+\]/g, '.get_center()');

        // Fix 4: Remove .code_object access
        code = code.replace(/\.code_object\.get_lines\(\)/g, '');
        code = code.replace(/\.code_object/g, '');

        // Fix 5: Replace problematic highlighting attempts
        code = code.replace(/SurroundingRectangle\(\s*[^,]*\.submobjects\[[^\]]*\]/g,
            'Rectangle(width=3, height=0.4, color=YELLOW, fill_opacity=0.3)');

        // Fix 6: Fix VGroup circular reference issues
        // Replace patterns like .next_to(topics[0], DOWN) inside VGroup construction
        code = code.replace(/\.next_to\(\w+\[\d+\],\s*\w+(?:,\s*buff=[0-9.]+)?\)/g, '');

        // Fix 7: Remove any remaining circular references in VGroup
        const vgroupPattern = /VGroup\([^)]*\w+\[\d+\][^)]*\)/g;
        if (vgroupPattern.test(code)) {
            // If we find VGroup with array indexing, comment out the problematic line
            code = code.replace(/^(\s*)(.*\w+\[\d+\].*)$/gm, '$1# $2  # Fixed: Circular reference removed');
        }

        // Fix 8: Replace undefined BROWN color with valid alternative
        code = code.replace(/color=BROWN/g, 'color="#8B4513"');
        code = code.replace(/color=BROWN,/g, 'color="#8B4513",');

        // Fix 9: Replace SVG file references with basic shapes
        // Replace SVGMobject references with basic geometric shapes
        code = code.replace(/SVGMobject\(["']timer\.svg["']\)/g, 'Circle(radius=0.5, color=BLUE)');
        code = code.replace(/SVGMobject\(["'][^"']*\.svg["']\)/g, 'Rectangle(width=1, height=1, color=GRAY)');

        // Fix 10: Replace Diamond shapes with equivalent Polygons
        // Diamond is not a built-in Manim shape, so we need to create it using Polygon
        code = code.replace(/Diamond\(([^)]+)\)/g, (match, params) => {
            // Extract width, height and other parameters
            const widthMatch = params.match(/width=([0-9.]+)/);
            const heightMatch = params.match(/height=([0-9.]+)/);
            const colorMatch = params.match(/color=([A-Z_]+|"[^"]*"|'[^']*')/);
            const fillOpacityMatch = params.match(/fill_opacity=([0-9.]+)/);
            
            const width = widthMatch ? parseFloat(widthMatch[1]) : 2;
            const height = heightMatch ? parseFloat(heightMatch[1]) : 2;
            const color = colorMatch ? colorMatch[1] : 'WHITE';
            const fillOpacity = fillOpacityMatch ? fillOpacityMatch[1] : '0.2';
            
            // Create a diamond using Polygon with diamond-shaped vertices
            const halfWidth = width / 2;
            const halfHeight = height / 2;
            
            return `Polygon([0, ${halfHeight}, 0], [${halfWidth}, 0, 0], [0, -${halfHeight}, 0], [-${halfWidth}, 0, 0], color=${color}, fill_opacity=${fillOpacity})`;
        });

        // Fix 11: Ensure proper imports are included
        if (!code.includes('from manim import *')) {
            code = 'from manim import *\n\n' + code;
        }

        return code;
    }
}       