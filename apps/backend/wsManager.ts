import type { WebSocket } from "ws";
import { WS_EVENTS } from "comman/ws_event";
import prismaClient from "db/client";
import { TranscriptGenerator } from "./transcript_generator";
import { parsedTranscription } from "./lib/ParseTranscription";
import { SceneGenerator } from "./scene_generator";

interface Message {
    type: string,
    payload: any
}

export class WsManager {
    ws: WebSocket;
    transcript: any;
    scene_generator: any;
    constructor(ws: WebSocket) {
        this.ws = ws;
        this.transcript = new TranscriptGenerator();
        this.scene_generator = new SceneGenerator(ws);
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
            if (this.scene_generator.checkforProcess()) {
                this.ws.send(JSON.stringify({
                    type: WS_EVENTS["VIDEO_IN_PROCESS"],
                    payload: {
                        loading : true,
                        count : this.scene_generator.loadingCount()
                    }
                }))
            }
            const { prompt, projectId } = payload;
            const video = await prismaClient.video.create({
                data: {
                    prompt,
                    projectId
                }
            })
            this.sendMessage(WS_EVENTS.USER_NOTIFICATION, { message: "Transcriptions Generated" });
            const transcriptions = await this.transcript.generate_transcript(prompt);
            if (!transcriptions) return;
            const parsed_transcription = parsedTranscription(transcriptions);
            this.sendMessage(WS_EVENTS.USER_NOTIFICATION, { message: "Scenes Generated" });
            this.scene_generator.generate_all_scenes(parsed_transcription, video.id);
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