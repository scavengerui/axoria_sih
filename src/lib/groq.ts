import Groq from "groq-sdk";

// Models matching the active models from your Groq dashboard
export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";
export const FALLBACK_GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
  "qwen/qwen3.6-27b",
  "groq/compound-mini",
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
