import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;

const google = apiKey ? createGoogleGenerativeAI({ apiKey }) : null;

export const googleModel = google?.("gemini-3-flash-preview");

export async function generateWithGoogle(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  if (!googleModel) {
    throw new Error("Google API key not configured");
  }

  const response = await generateText({
    model: googleModel,
    prompt,
    system: systemPrompt,
    maxRetries: 1,
  });

  return response.text.trim();
}

export function isGoogleConfigured(): boolean {
  return !!apiKey;
}
