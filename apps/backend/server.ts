import express from "express";

export const app = express();

app.use(express.json());

app.listen(process.env.PORT || 3001);