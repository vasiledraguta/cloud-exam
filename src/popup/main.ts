import type { Keybind, PromptMode, Provider } from "../content/types";
import {
  MODE_LABELS,
  PROVIDER_LABELS,
  DEFAULT_KEYBIND,
  formatKeybind,
} from "../content/utils";
import "./style.css";

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
  
  <div class="setting-group">
    <span class="setting-label">Shortcut</span>
    <div class="keybind-recorder" id="keybind-recorder">
      <kbd class="keybind-display" id="keybind-display"></kbd>
      <button class="keybind-btn" id="keybind-btn">Record</button>
    </div>
  </div>
  
  <div class="status" id="status"></div>
`;

const promptButtons = app.querySelectorAll<HTMLButtonElement>("[data-prompt]");
const providerButtons =
  app.querySelectorAll<HTMLButtonElement>("[data-provider]");
const status = app.querySelector<HTMLDivElement>("#status")!;
const keybindRecorder = app.querySelector<HTMLDivElement>("#keybind-recorder")!;
const keybindDisplay = app.querySelector<HTMLElement>("#keybind-display")!;
const keybindBtn = app.querySelector<HTMLButtonElement>("#keybind-btn")!;

let isRecording = false;
let currentKeybind: Keybind = DEFAULT_KEYBIND;

chrome.storage.sync.get(["provider", "promptMode", "keybind"], (result) => {
  const savedProvider = (result.provider as Provider) || "openai";
  const savedPromptMode = (result.promptMode as PromptMode) || "general";
  currentKeybind = (result.keybind as Keybind) || DEFAULT_KEYBIND;

  setActiveProvider(savedProvider);
  setActivePromptMode(savedPromptMode);
  updateKeybindDisplay();
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

function updateKeybindDisplay(): void {
  keybindDisplay.textContent = formatKeybind(currentKeybind);
}

function startRecording(): void {
  isRecording = true;
  keybindRecorder.classList.add("recording");
  keybindDisplay.textContent = "Press shortcut...";
  keybindBtn.textContent = "Cancel";
}

function stopRecording(): void {
  isRecording = false;
  keybindRecorder.classList.remove("recording");
  keybindBtn.textContent = "Record";
  updateKeybindDisplay();
}

function handleKeybindCapture(event: KeyboardEvent): void {
  if (!isRecording) return;

  event.preventDefault();
  event.stopPropagation();

  if (event.key === "Escape") {
    stopRecording();
    return;
  }

  if (["Control", "Meta", "Alt", "Shift"].includes(event.key)) {
    return;
  }

  const newKeybind: Keybind = {
    key: event.key,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    altKey: event.altKey,
    shiftKey: event.shiftKey,
  };

  currentKeybind = newKeybind;
  chrome.storage.sync.set({ keybind: newKeybind }, () => {
    stopRecording();
    showStatus(`Shortcut set to ${formatKeybind(newKeybind)}`, true);
  });
}

keybindBtn.addEventListener("click", () => {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
});

document.addEventListener("keydown", handleKeybindCapture);

providerButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const provider = btn.dataset.provider as Provider;
    chrome.storage.sync.set({ provider }, () => {
      setActiveProvider(provider);
      showStatus(`Using ${PROVIDER_LABELS[provider]}`, true);
    });
  });
});

promptButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const mode = btn.dataset.prompt as PromptMode;
    chrome.storage.sync.set({ promptMode: mode }, () => {
      setActivePromptMode(mode);
      showStatus(`Using ${MODE_LABELS[mode]} mode`, true);
    });
  });
});
