import { Mistral } from "@mistralai/mistralai";

export const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
