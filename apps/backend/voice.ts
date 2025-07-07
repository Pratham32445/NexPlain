import { ElevenLabsClient, play } from '@elevenlabs/elevenlabs-js';

const elevanLabs = new ElevenLabsClient({ apiKey: process.env.NEXT_PUBLIC_ELEVEN_API_KEY });


export const generateSpeech = async (text: string) => {
    const audio = await elevanLabs.textToSpeech.convert("ZT9u07TYPVl83ejeLakq", {
        text,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128"
    });
    return audio;
}