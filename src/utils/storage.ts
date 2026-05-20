import type { Conversation } from "@/lib/types";
import { logError } from "./logger";

const CONVERSATIONS_KEY = "sythoria-conversations";
const THEME_KEY = "sythoria-theme";
const API_KEYS_KEY = "sythoria-api-keys";
const CONFIG_KEY = "sythoria-model-configs";

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    logError("Failed to load conversations from localStorage", e);
  }
  return [];
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (e) {
    logError("Failed to save conversations to localStorage", e);
  }
}

export function loadTheme(): "light" | "dark" {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === "light" || raw === "dark") return raw;
  } catch (e) {
    logError("Failed to load theme", e);
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function saveTheme(theme: "light" | "dark"): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    logError("Failed to save theme", e);
  }
}

export function loadApiKeys(): Record<string, string> {
  try {
    const raw = localStorage.getItem(API_KEYS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    logError("Failed to load API keys", e);
  }
  return {};
}

export function saveApiKeys(keys: Record<string, string>): void {
  try {
    localStorage.setItem(API_KEYS_KEY, JSON.stringify(keys));
  } catch (e) {
    logError("Failed to save API keys", e);
  }
}

export function loadModelConfigs(): unknown[] | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    logError("Failed to load model configs from localStorage", e);
  }
  return null;
}

export function saveModelConfigs(configs: unknown[]): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(configs));
  } catch (e) {
    logError("Failed to save model configs to localStorage", e);
  }
}

export function clearConversations(): void {
  localStorage.removeItem(CONVERSATIONS_KEY);
}
