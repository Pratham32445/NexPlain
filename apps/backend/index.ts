import { parsedTranscription } from "./lib/ParseTranscription";
import { storeVideoToS3 } from "./s3/storage";
import { SceneGenerator } from "./scene_generator";
import { app } from "./server";
import { TranscriptGenerator } from "./transcript_generator";
    
app.post("/generate-video", async (req, res) => {
    const { prompt,videoId } = req.body;
    if (!prompt) {
        res.status(401).json({
            message: "Please provide the prompt"
        })
        return;
    }
    const transcript = new TranscriptGenerator();
    const transcriptions = await transcript.generate_transcript(prompt);
    if(!transcriptions) return ;
    const parsed_transcription = parsedTranscription(transcriptions);
    const scene_generator = new SceneGenerator(parsed_transcription,videoId);
    scene_generator.generate_all_scenes();
    res.send("done");
})