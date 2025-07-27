import { fal } from "@fal-ai/client";

export async function generateVoiceOver(transcriptions: string[]) {
    fal.config({
        credentials: process.env.FAL_AI_KEY!
    })
    const transcriptionstr = transcriptions.join(" ");
    await fal.queue.submit("fal-ai/playai/tts/dialog", {
        input: {
            input: `voice 1 ${transcriptionstr}`,
            voices: [
                {
                    voice: "Sumita (English (IN)/Indian)",
                    turn_prefix: `voice 1`
                }
            ],
            response_format: "url"
        },
        webhookUrl: `http://localhost:3002/audio`,
    })
}