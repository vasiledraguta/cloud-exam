import { generateWithGoogle, isGoogleConfigured } from "./providers/google";
import { generateWithOpenAI, isOpenAIConfigured } from "./providers/openai";
import { SYSTEM_PROMPT, buildPrompt } from "./prompts";
import "./style.css";

type Provider = "openai" | "google";

async function getProvider(): Promise<Provider | null> {
  return new Promise((resolve) => {
    chrome.storage.sync.get("provider", (result) => {
      const provider = (result.provider as Provider) || "openai";

      if (provider === "openai" && isOpenAIConfigured()) {
        resolve("openai");
      } else if (provider === "google" && isGoogleConfigured()) {
        resolve("google");
      } else if (isOpenAIConfigured()) {
        resolve("openai");
      } else if (isGoogleConfigured()) {
        resolve("google");
      } else {
        resolve(null);
      }
    });
  });
}

function getSelectionText(): string {
  return window.getSelection()?.toString().trim() || "";
}

let answerBox: HTMLDivElement | null = null;
let hideTimeout: ReturnType<typeof setTimeout> | null = null;

function showAnswer(content: string, isLoading = false): void {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }

  if (!answerBox) {
    answerBox = document.createElement("div");
    answerBox.className = "cloud-exam-answer";
    document.body.appendChild(answerBox);
  }

  answerBox.classList.remove("hidden");

  if (isLoading) {
    answerBox.innerHTML = `<div class="cloud-exam-loading">Thinking...</div>`;
  } else {
    answerBox.textContent = content;
    hideTimeout = setTimeout(() => {
      answerBox?.classList.add("hidden");
    }, 10000);
  }
}

function hideAnswer(): void {
  answerBox?.classList.add("hidden");
}

async function generateAnswer(text: string): Promise<string> {
  const provider = await getProvider();

  if (!provider) {
    return "No API key configured. Set VITE_OPENAI_API_KEY or VITE_GOOGLE_AI_API_KEY in .env";
  }

  const prompt = buildPrompt(text);

  try {
    if (provider === "openai") {
      return await generateWithOpenAI(prompt, SYSTEM_PROMPT);
    } else {
      return await generateWithGoogle(prompt, SYSTEM_PROMPT);
    }
  } catch (error) {
    console.error("[cloud-exam] AI error:", error);
    return "Error: Could not get answer";
  }
}

document.addEventListener("keydown", async (event) => {
  if (event.key === "k" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();

    const text = getSelectionText();
    if (!text) {
      showAnswer("Select some text first");
      return;
    }

    showAnswer("", true);
    const answer = await generateAnswer(text);
    showAnswer(answer);
  }

  if (event.key === "Escape") {
    hideAnswer();
  }
});
