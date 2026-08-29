import Groq from "groq-sdk";

// Valid official active production models on Groq
export const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
export const FALLBACK_GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
];

export function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY || "";
  return new Groq({
    apiKey,
  });
}

// Fallback singleton
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export default getGroqClient;
