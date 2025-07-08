import fs from "fs";
import path from "path";

const BASE_SCENE_PATH = "/generated/scenes"
const BASE_AUDIO_PATH = "/generated/audio"
const BASE_VIDEO_PATH = "/generated/video"

export function createFileAndWrite(videoId: string, idx: string, content: string) {
    const dirPath = path.join(BASE_SCENE_PATH, videoId);
    const fullPath = path.join(dirPath, `${String(idx)}.py`);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(fullPath, content);
}

export async function storeVoice(videoId: string, scene_id: string, voice: ReadableStream<Uint8Array<ArrayBufferLike>>) {
    const dirPath = path.join(BASE_AUDIO_PATH, videoId);
    const fullPath = path.join(dirPath, `${scene_id}.wav`);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    const writable = fs.createWriteStream(fullPath);
    const reader = voice.getReader();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        writable.write(Buffer.from(value));
    }

    writable.end();
}


export const removePartialFiles = (videoId: string, sceneId: string) => {
    const partial_file_path = path.join(BASE_VIDEO_PATH, videoId, sceneId, "videos", sceneId, "480p15", "partial_movie_files");

    try {
        if (fs.existsSync(partial_file_path)) {
            fs.rmSync(partial_file_path, { recursive: true, force: true });
        }
    } catch (error) {
        console.error(`Error removing partial files for scene ${sceneId}:`, error);
    }
};