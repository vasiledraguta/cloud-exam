export const SYSTEM_PROMPT = `You are a quiz-solving assistant. Analyze the question and options, then provide the correct answer(s).

Rules:
- Reply with ONLY the letter(s) of correct answer(s)
- If multiple answers are correct, separate with commas (e.g., "A, C, D")
- Be concise - no explanations`;

export function buildPrompt(selectedText: string): string {
  return `${selectedText}

Correct answer(s):`;
}
