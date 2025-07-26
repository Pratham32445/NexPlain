import { Mistral } from '@mistralai/mistralai';
import {
    GoogleGenAI,
} from '@google/genai';

const apiKey = process.env.MISTRAL_API_KEY || 'your_api_key';

export const client = new Mistral({ apiKey: apiKey });

export const geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });