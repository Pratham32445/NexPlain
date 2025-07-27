import express from "express";

export const app = express();

app.post("/audio", (req, res) => {
    console.log(req.body);
    res.send("Hello");
})

export function startHttpServer() {
    app.listen(3002);
}

