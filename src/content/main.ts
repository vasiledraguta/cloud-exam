import { generateWithGoogle, isGoogleConfigured } from "./providers/google";
import { generateWithOpenAI, isOpenAIConfigured } from "./providers/openai";
import { PROMPTS } from "./prompts";
import type { Keybind, PromptMode, Provider } from "./types";
import { DEFAULT_KEYBIND, buildPrompt, buildCaseStudyPrompt } from "./utils";
import "./style.css";

const ANSWER_DISPLAY_TIMEOUT = 10000;

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

async function getPromptMode(): Promise<PromptMode> {
  return new Promise((resolve) => {
    chrome.storage.sync.get("promptMode", (result) => {
      resolve((result.promptMode as PromptMode) || "general");
    });
  });
}

async function getKeybind(): Promise<Keybind> {
  return new Promise((resolve) => {
    chrome.storage.sync.get("keybind", (result) => {
      resolve((result.keybind as Keybind) || DEFAULT_KEYBIND);
    });
  });
}

function matchesKeybind(event: KeyboardEvent, keybind: Keybind): boolean {
  const keyMatches = event.key.toLowerCase() === keybind.key.toLowerCase();
  const ctrlMatches = event.ctrlKey === keybind.ctrlKey;
  const metaMatches = event.metaKey === keybind.metaKey;
  const altMatches = event.altKey === keybind.altKey;
  const shiftMatches = event.shiftKey === keybind.shiftKey;

  return keyMatches && ctrlMatches && metaMatches && altMatches && shiftMatches;
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
    }, ANSWER_DISPLAY_TIMEOUT);
  }
}

function hideAnswer(): void {
  answerBox?.classList.add("hidden");
}

async function generateAnswer(
  text: string,
  promptMode: PromptMode,
): Promise<string> {
  const provider = await getProvider();

  if (!provider) {
    return "No API key configured. Set VITE_OPENAI_API_KEY or VITE_GOOGLE_AI_API_KEY in .env";
  }

  let prompt = "";
  if (promptMode === "caseStudy") {
    prompt = buildCaseStudyPrompt(text);
  } else {
    prompt = buildPrompt(text);
  }
  const systemPrompt = PROMPTS[promptMode];

  try {
    if (provider === "openai") {
      return await generateWithOpenAI(prompt, systemPrompt);
    } else {
      return await generateWithGoogle(prompt, systemPrompt);
    }
  } catch (error) {
    console.error("[cloud-exam] AI error:", error);
    return "Error: Could not get answer";
  }
}

document.addEventListener("keydown", async (event) => {
  const keybind = await getKeybind();

  if (matchesKeybind(event, keybind)) {
    event.preventDefault();

    const text = getSelectionText();
    if (!text) {
      showAnswer("Select some text first");
      return;
    }

    const promptMode = await getPromptMode();
    if (promptMode === "caseStudy") {
      showAnswer("Thinking about the case study...", true);
      const answer = await generateAnswer(text, promptMode);
      try {
        await navigator.clipboard.writeText(answer);
        showAnswer("Answer copied to clipboard");
      } catch (error) {
        console.error("[cloud-exam] Error copying answer to clipboard:", error);
        showAnswer("Error: Could not copy answer to clipboard");
      }
    } else {
      showAnswer("Thinking...", true);
      const answer = await generateAnswer(text, promptMode);
      showAnswer(answer);
    }
  }

  if (event.key === "Escape") {
    hideAnswer();
  }
});
