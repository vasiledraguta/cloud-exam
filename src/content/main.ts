import { generateWithGoogle, isGoogleConfigured } from "./providers/google";
import { generateWithOpenAI, isOpenAIConfigured } from "./providers/openai";
import { SYSTEM_PROMPT, buildPrompt } from "./prompts";

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

function injectStyles(): void {
  if (document.querySelector("#cloud-exam-styles")) return;

  const style = document.createElement("style");
  style.id = "cloud-exam-styles";
  style.textContent = `
    .cloud-exam-answer {
      position: fixed;
      bottom: 20px;
      right: 20px;
      max-width: 400px;
      padding: 16px;
      background: rgba(0, 0, 0, 0.9);
      color: #fff;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.5;
      z-index: 999999;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      animation: cloud-exam-fade-in 0.2s ease-out;
    }
    .cloud-exam-answer.hidden {
      display: none;
    }
    @keyframes cloud-exam-fade-in {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .cloud-exam-loading {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cloud-exam-loading::before {
      content: "";
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: cloud-exam-spin 0.8s linear infinite;
    }
    @keyframes cloud-exam-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
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

injectStyles();

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
