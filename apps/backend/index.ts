import { WebSocketServer,WebSocket } from "ws";
import { WsManager } from "./wsManager";
import { startHttpServer } from "./server";

const wss = new WebSocketServer({ port: 3001 });
startHttpServer();


wss.on("connection", (ws:WebSocket) => {
    new WsManager(ws);
})  

