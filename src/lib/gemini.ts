import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY?.trim() || "";

export const geminiClient = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const GEMINI_MODEL_PRIMARY = "gemini-3.5-flash-lite";
export const GEMINI_MODEL_FALLBACK = "gemini-3.5-flash";
