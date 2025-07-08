import {Mistral} from "@mistralai/mistralai";

const apiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY;

export const client = new Mistral({apiKey});
    