import fs from "fs";
import path from "path";

    
export function StoreScene(videoId: string, Idx: number, res: string) {
    const SCENE_BASE_PATH = path.join("generated", videoId, "scenes");
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