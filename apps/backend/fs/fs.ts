import fs from "fs";
import path from "path";

const BASE_SCENE_PATH = "/generated/scenes"
const BASE_AUDIO_PATH = "/generated/audio"

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