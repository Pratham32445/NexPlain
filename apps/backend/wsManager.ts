import type { WebSocket } from "ws";
import { WS_EVENTS } from "./EVENTS";
import prismaClient from "db/client";
import { TranscriptGenerator } from "./transcript_generator";
import { parsedTranscription } from "./lib/ParseTranscription";
import { SceneGenerator } from "./scene_generator";
import { generateVoiceOver } from "./tts";

interface Message {
    type: string,
    payload: any
}

export class WsManager {
    ws: WebSocket;
    constructor(ws: WebSocket) {
        this.ws = ws;
        this.init();
    }
    init() {
        this.ws.onmessage = (event) => {
            console.log(event.data.toString());
            const message: Message = JSON.parse(event.data.toString());
            switch (message.type) {
                case WS_EVENTS.GENERATE_VIDEO:
                    this.generate_video(message.payload);
                    break;
                default:
                    break;
            }
        }
    }
    async generate_video(payload: any) {
        try {
            const { prompt, projectId } = payload;
            const video = await prismaClient.video.create({
                data: {
                    prompt,
                    projectId
                }
            })
            const transcript = new TranscriptGenerator();
            this.sendMessage(WS_EVENTS.USER_NOTIFICATION, { message: "Transcriptions Generated" });
            const transcriptions = await transcript.generate_transcript(prompt);
            if (!transcriptions) return;
            const parsed_transcription = parsedTranscription(transcriptions);
            console.log(parsed_transcription);
            const scene_generator = new SceneGenerator(parsed_transcription, video.Id, this.ws);
            this.sendMessage(WS_EVENTS.USER_NOTIFICATION, { message: "Scenes Generated" });
            scene_generator.generate_all_scenes();
        } catch (error) {
            console.log(error); 
        }
    }
    sendMessage(type: string, payload: any) {
        this.ws.send(JSON.stringify({
            type,
            payload
        }))
    }
}