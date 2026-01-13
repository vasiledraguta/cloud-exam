import "./style.css";

type Provider = "openai" | "google";
type PromptMode = "aws" | "general" | "caseStudy";

const app = document.querySelector("#app")!;

app.innerHTML = `
  <h1>Cloud Exam</h1>
  
  <div class="setting-group">
    <span class="setting-label">Prompt Mode</span>
    <div class="setting-options">
      <button class="setting-btn" data-prompt="aws">AWS Exam</button>
      <button class="setting-btn" data-prompt="general">General Cloud</button>
      <button class="setting-btn" data-prompt="caseStudy">Case Study</button>
    </div>
  </div>
  
  <div class="setting-group">
    <span class="setting-label">AI Provider</span>
    <div class="setting-options">
      <button class="setting-btn" data-provider="openai">OpenAI</button>
      <button class="setting-btn" data-provider="google">Google</button>
    </div>
  </div>
  
  <div class="shortcut">
    <span>Select text +</span>
    <kbd>⌘</kbd><kbd>K</kbd>
  </div>
  
  <div class="status" id="status"></div>
`;

const promptButtons = app.querySelectorAll<HTMLButtonElement>("[data-prompt]");
const providerButtons =
  app.querySelectorAll<HTMLButtonElement>("[data-provider]");
const status = app.querySelector<HTMLDivElement>("#status")!;

chrome.storage.sync.get(["provider", "promptMode"], (result) => {
  const savedProvider = (result.provider as Provider) || "openai";
  const savedPromptMode = (result.promptMode as PromptMode) || "general";
  setActiveProvider(savedProvider);
  setActivePromptMode(savedPromptMode);
});

function setActiveProvider(provider: Provider): void {
  providerButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.provider === provider);
  });
}

function setActivePromptMode(mode: PromptMode): void {
  promptButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.prompt === mode);
  });
}

function showStatus(message: string, isSuccess = false): void {
  status.textContent = message;
  status.classList.toggle("success", isSuccess);
  setTimeout(() => {
    status.textContent = "";
  }, 2000);
}

providerButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const provider = btn.dataset.provider as Provider;
    chrome.storage.sync.set({ provider }, () => {
      setActiveProvider(provider);
      showStatus(`Using ${provider === "openai" ? "OpenAI" : "Google"}`, true);
    });
  });
});

promptButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const mode = btn.dataset.prompt as PromptMode;
    chrome.storage.sync.set({ promptMode: mode }, () => {
      setActivePromptMode(mode);
      showStatus(
        `Using ${mode === "aws" ? "AWS Exam" : mode === "general" ? "General Cloud" : "Case Study"} mode`,
        true
      );
    });
  });
});
