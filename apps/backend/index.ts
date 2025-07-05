import { SceneGenerator } from "./SceneGenerator";
import { app } from "./server";
import { TranscriptGenerator } from "./transcript_generator";


app.post("/generate-video",async (req,res) => {
    const {prompt,emotion,projectId,videoId} = req.body;
    if(!prompt) {
        res.status(404).json({
            error : "Prompt not found"
        })
        return ;
    }
    const transcript = new TranscriptGenerator();
    const transcriptions = await transcript.generate_transcript(prompt,emotion);
    const scene_generator = SceneGenerator(transcriptions,videoId);
    res.send(transcriptions);
})