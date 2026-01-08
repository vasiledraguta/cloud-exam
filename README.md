# cloud-exam

## Setup

1. Install dependencies:

```bash
bun install
```

2. Create `.env` file with your API key:

```bash
# OpenAI (default)
VITE_OPENAI_API_KEY=sk-...

# Or Google AI
VITE_GOOGLE_AI_API_KEY=...
```

3. Build the extension:

```bash
bun run build
```

4. Load in Chrome:
   - Go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder
