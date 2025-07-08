import path from "path";
import { exec, execSync } from "child_process";
import fs, { mkdir, mkdirSync } from "fs";

const RENDER_VIDEO_PATH = "/generated/video";
const SCENE_PATH = "/generated/scenes";
const OUTPUT_VIDEO_PATH = "/generated/output"
const AUDIO_PATH = "/generated/audio";

export function renderScene(videoId: string, scene_id: string) {
    return new Promise((resolve, reject) => {
        const input_manim_path = path.join(SCENE_PATH, videoId, `${scene_id}.py`);
        const output_scene_path = path.join(RENDER_VIDEO_PATH, videoId, scene_id);

        const command = `manim render -ql "${input_manim_path}" -o video --media_dir "${output_scene_path}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error rendering scene: ${stderr}`);
                reject(error);
            } else {
                console.log("rendered", scene_id);
                resolve("Done");
            }
        });
    });
}

export async function syncVideoAndAudio(videoId: string, scene_id: string) {
    try {
        const video_path = path.join(RENDER_VIDEO_PATH, videoId, scene_id, "videos", scene_id, "480p15", "video.mp4");
        const audio_path = path.join(AUDIO_PATH, videoId, `${scene_id}.wav`);
        const output_path = path.join(OUTPUT_VIDEO_PATH, videoId, `${scene_id}_synced.mp4`);

        const output_dir = path.dirname(output_path);
        mkdirSync(output_dir, { recursive: true });

        const command = `ffmpeg -i "${video_path}" -i "${audio_path}" -c:v copy -c:a aac -strict experimental -y "${output_path}"`;

        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error syncing video/audio for scene ${scene_id}:`, stderr);
                    reject(error);
                } else {
                    console.log(`✅ Video/audio synced for scene ${scene_id}`);
                    resolve(output_path);
                }
            });
        });
    } catch (error) {
        console.error(`Error creating output directory:`, error);
        throw error;
    }
}

export function createProductionCut(videoId: string) {
    const final_path = path.join(OUTPUT_VIDEO_PATH, videoId);
    const files = fs.readdirSync(final_path).filter(file => path.join(final_path, file));
    if (files.length == 0) {
        console.log("No output files");
        return;
    }
    const fileListPath = path.join(final_path, "filelist.txt");
    const fileListContent = files.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join('\n');
    fs.writeFileSync(fileListPath, fileListContent);
    const output_video = path.join(final_path, `${videoId}.mp4`);
    const cmd = `ffmpeg -f concat -safe 0 -i "${fileListPath}" -c copy "${output_video}"`;
    try {
        execSync(cmd, { stdio: "inherit" });
        console.log("video Generated");
    } catch (error) {
        console.log("error Generating video", error);
    } finally {
        fs.unlinkSync(fileListPath);
    }
}