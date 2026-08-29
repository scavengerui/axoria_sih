import Groq from "groq-sdk";

// Verified active production models on your Groq account
export const DEFAULT_GROQ_MODEL = "qwen/qwen3.8-27b";
export const FALLBACK_GROQ_MODELS = [
  "qwen/qwen3.8-27b",
  "groq/compound-mini",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.6-27b",
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
