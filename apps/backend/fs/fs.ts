import fs from "fs";
import path from "path";
import { exec } from "child_process";

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

export function clipUnCompletedVideos(scene_id: number, video_id: string) {
    const root_path = `${BASE_PATH}/${video_id}/${scene_id}/videos/${scene_id}/720p30`;
    const input_path = `${root_path}/partial_movie_files/VideoScene`;
    const output_path = `${root_path}/video.mp4`;

    if (!fs.existsSync(input_path)) {
        console.log(`Input directory not found: ${input_path}`);
        return;
    }

    try {
        const files = fs.readdirSync(input_path)
            .filter(file => file.endsWith('.mp4'))
            .sort((a, b) => {
                const numA = parseInt(a.replace(/\D/g, ''));
                const numB = parseInt(b.replace(/\D/g, ''));
                return numA - numB;
            });

        if (files.length === 0) {
            console.log(`No video files found in: ${input_path}`);
            return;
        }

        const fileListPath = path.join(root_path, 'file_list.txt');
        const fileContent = files
            .map(file => `file '${path.join(input_path, file).replace(/\\/g, '/')}'`)
            .join('\n');

        fs.writeFileSync(fileListPath, fileContent);

        const cmd = `ffmpeg -f concat -safe 0 -i "${fileListPath.replace(/\\/g, '/')}" -c copy "${output_path.replace(/\\/g, '/')}"`;

        exec(cmd, (error: any, stdout: any, stderr: any) => {
            if (error) {
                console.error(`Error joining videos for scene ${scene_id}:`, error);
                return;
            }

            console.log(`Successfully joined partial videos for scene ${scene_id}`);

            try {
                fs.unlinkSync(fileListPath);
            } catch (cleanupError) {
                console.warn(`Could not clean up file list: ${cleanupError}`);
            }

            const partialMovieDir = path.join(root_path, 'partial_movie_files');
            try {
                if (fs.existsSync(partialMovieDir)) {
                    fs.rmSync(partialMovieDir, { recursive: true, force: true });
                    console.log(`Removed partial_movie_files directory: ${partialMovieDir}`);
                }
            } catch (removeError) {
                console.warn(`Could not remove partial_movie_files directory: ${removeError}`);
            }
        });

    } catch (error) {
        console.error(`Error processing partial videos for scene ${scene_id}:`, error);
    }
}

export function clearParitalFiles(video_id: string) {
    const folder_path = `${BASE_PATH}/${video_id}`
    if (!fs.existsSync(folder_path)) return;
    fs.rmSync(folder_path, { recursive: true, force: true });
    console.log(`Cleared Everything`);
}