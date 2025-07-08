import { app } from "./server";
import { prismaClient } from "db/client";
import { TranscriptGenerator } from "./transcript_generator";
import { SceneGenerator } from "./scene_generator";
import { parseTranscription } from "./lib/transcription";


app.post("/generate-video", async (req, res) => {
    const { prompt, videoId } = req.body;
    if (!prompt) {
        res.status(401).json({
            message: "Please provide the prompt"
        })
        return;
    }
    const transcript = new TranscriptGenerator();
    const allTranscriptions = await transcript.generate_transcript(prompt);
    if (!allTranscriptions) return;
    const parsed_transcriptions = parseTranscription(allTranscriptions);
    const scene_generator = new SceneGenerator(parsed_transcriptions,videoId);
    await scene_generator.generate_all_scenes();
    res.send("Hello");
})  
