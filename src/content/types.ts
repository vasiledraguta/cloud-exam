export type PromptMode = "aws" | "general" | "caseStudy";
export type Provider = "openai" | "google";

export interface Keybind {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
}
