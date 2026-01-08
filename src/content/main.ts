import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;

if (!apiKey) {
  throw new Error("VITE_GOOGLE_AI_API_KEY is not set");
}

const google = createGoogleGenerativeAI({ apiKey });
const model = google("gemini-3-flash-preview");

async function generateAnswer(text: string) {
  const response = await generateText({
    model,
    prompt: text,
  });
  return response.text;
}

function getSelectionText(): string {
  let text = "";

  if (window.getSelection) {
    text = window.getSelection()?.toString() ?? "";
  }

  return text.trim();
}

document.addEventListener("keydown", async (event) => {
  if (event.key === "k" && (event.ctrlKey || event.metaKey)) {
    const text = getSelectionText();
    if (text) {
      const answer = await generateAnswer(text);
      console.log(answer);
    }
  }
});
