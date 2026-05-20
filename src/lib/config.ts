export const PROVIDER_PRESETS = [
  { label: "OpenAI", apiBase: "https://api.openai.com/v1/chat/completions", defaultModel: "gpt-4o" },
  { label: "Anthropic", apiBase: "https://api.anthropic.com/v1/messages", defaultModel: "claude-3-5-sonnet-20240620" },
  {
    label: "Google Gemini",
    apiBase: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    defaultModel: "gemini-2.5-pro",
  },
  { label: "Ollama (Local)", apiBase: "http://localhost:11434/v1/chat/completions", defaultModel: "llama3.1" },
  {
    label: "NVIDIA NIM",
    apiBase: "https://integrate.api.nvidia.com/v1/chat/completions",
    defaultModel: "meta/llama-3.3-70b-instruct",
  },
  {
    label: "OpenRouter",
    apiBase: "https://openrouter.ai/api/v1/chat/completions",
    defaultModel: "anthropic/claude-3.5-sonnet",
  },
  { label: "Custom", apiBase: "", defaultModel: "" },
] as const;

export const MAX_INPUT_LENGTH = 10000;
export const MAX_TEXTAREA_HEIGHT = 200;
export const DEBOUNCE_MS = 150;
export const TITLE_MAX_LENGTH = 40;
export const ID_LENGTH = 8;
export const DEFAULT_TEMPERATURE = 0.7;
export const MAX_TEMPERATURE = 2.0;
export const MIN_TEMPERATURE = 0.0;
export const TEMPERATURE_STEP = 0.1;
export const SIDEBAR_WIDTH = 260;
