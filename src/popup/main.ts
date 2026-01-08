import "./style.css";

type Provider = "openai" | "google";

const app = document.querySelector("#app")!;

app.innerHTML = `
  <h1>Cloud Exam</h1>
  
  <div class="provider-group">
    <span class="provider-label">AI Provider</span>
    <div class="provider-options">
      <button class="provider-btn" data-provider="openai">OpenAI</button>
      <button class="provider-btn" data-provider="google">Google</button>
    </div>
  </div>
  
  <div class="shortcut">
    <span>Select text +</span>
    <kbd>⌘</kbd><kbd>K</kbd>
  </div>
  
  <div class="status" id="status"></div>
`;

const buttons = app.querySelectorAll<HTMLButtonElement>(".provider-btn");
const status = app.querySelector<HTMLDivElement>("#status")!;

chrome.storage.sync.get("provider", (result) => {
  const saved = (result.provider as Provider) || "openai";
  setActiveProvider(saved);
});

function setActiveProvider(provider: Provider): void {
  buttons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.provider === provider);
  });
}

function showStatus(message: string, isSuccess = false): void {
  status.textContent = message;
  status.classList.toggle("success", isSuccess);
  setTimeout(() => {
    status.textContent = "";
  }, 2000);
}

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const provider = btn.dataset.provider as Provider;
    chrome.storage.sync.set({ provider }, () => {
      setActiveProvider(provider);
      showStatus(`Using ${provider === "openai" ? "OpenAI" : "Google"}`, true);
    });
  });
});
