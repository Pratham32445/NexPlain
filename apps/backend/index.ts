import { WebSocketServer,WebSocket } from "ws";
import { WsManager } from "./wsManager";

const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", (ws:WebSocket) => {
    new WsManager(ws);
})