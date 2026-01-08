import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const openai = apiKey ? createOpenAI({ apiKey }) : null;

export const openaiModel = openai?.("o4-mini");

export async function generateWithOpenAI(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  if (!openaiModel) {
    throw new Error("OpenAI API key not configured");
  }

  const response = await generateText({
    model: openaiModel,
    prompt,
    system: systemPrompt,
    maxRetries: 1,
  });

  return response.text.trim();
}

export function isOpenAIConfigured(): boolean {
  return !!apiKey;
}
