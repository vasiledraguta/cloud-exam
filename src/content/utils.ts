import type { Keybind, PromptMode, Provider } from "./types";

export const DEFAULT_KEYBIND: Keybind = {
  key: "k",
  ctrlKey: true,
  metaKey: true,
  altKey: false,
  shiftKey: false,
};

export const MODE_LABELS: Record<PromptMode, string> = {
  aws: "AWS Exam",
  general: "General Cloud",
  caseStudy: "Case Study",
};

export const PROVIDER_LABELS: Record<Provider, string> = {
  openai: "OpenAI",
  google: "Google",
};

export function formatKeybind(keybind: Keybind): string {
  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const parts: string[] = [];

  if (isMac) {
    if (keybind.ctrlKey) parts.push("⌃");
    if (keybind.metaKey) parts.push("⌘");
    if (keybind.altKey) parts.push("⌥");
    if (keybind.shiftKey) parts.push("⇧");
    parts.push(keybind.key.toUpperCase());
  } else {
    if (keybind.ctrlKey) parts.push("Ctrl+");
    if (keybind.metaKey) parts.push("Win+");
    if (keybind.altKey) parts.push("Alt+");
    if (keybind.shiftKey) parts.push("Shift+");
    parts.push(keybind.key.toUpperCase());
  }

  return parts.join("");
}

export function buildPrompt(selectedText: string): string {
  return `Exam Question:

${selectedText}

Correct answer(s):`;
}

export function buildCaseStudyPrompt(selectedText: string): string {
  return `Case Study:

${selectedText}

Answer:`;
}
