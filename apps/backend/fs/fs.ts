import fs from "fs";
import path from "path";

const BASE_PATH = '/generated';


export function StoreScene(videoId: string, Idx: number, res: string) {
    const SCENE_BASE_PATH = path.join(BASE_PATH, videoId, "scenes");
    const SCENE_FILE = path.join(SCENE_BASE_PATH, `${Idx}.py`);

    try {
        if (!fs.existsSync(SCENE_BASE_PATH)) {
            fs.mkdirSync(SCENE_BASE_PATH, { recursive: true });
        }
        if (fs.existsSync(SCENE_FILE)) return;
        fs.writeFileSync(SCENE_FILE, res, "utf-8");
    } catch (error) {
        console.error(`Failed to store scene ${Idx} for video ${videoId}:`, error);
    }
}

export async function removePartialFiles(videoId: string, sceneId: number) {
    const partialDirPath = path.join(
        BASE_PATH,
        videoId,
        String(sceneId),
        "videos",
        String(sceneId),
        "720p30",
        "partial_movie_files"
    );

    try {
        if (fs.existsSync(partialDirPath)) {
            await fs.promises.rm(partialDirPath, { recursive: true, force: true });
            console.log(`Removed directory: ${partialDirPath}`);
        } else {
            console.log(`Directory not found: ${partialDirPath}`);
        }
    } catch (error) {
        console.error(`Error removing directory ${partialDirPath}:`, error);
    }
}

export function getFileContent(videoId: string, scene_id: Number) {
    const filePath = path.join("/generated", videoId, "scenes", `${scene_id}.py`);
    return fs.readFileSync(filePath, "utf-8");
}

export async function removeDir(path: string) {
    if (fs.existsSync(path)) {
        await fs.promises.rm(path, { recursive: true, force: true });
    }
}