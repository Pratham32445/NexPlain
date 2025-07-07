import path from "path";
import { exec } from "child_process";

const RENDER_VIDEO_PATH = "/generated/video";
const SCENE_PATH = "/generated/scenes";

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
                console.log(`Scene rendered: ${stdout}`);
                resolve("Done");
            }
        });
    });
}