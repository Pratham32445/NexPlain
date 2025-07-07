import express from "express"
import cors from "cors";

export const app = express();

app.use(express.json());
app.use(cors());

app.listen(process.env.PORT || 3001); 



