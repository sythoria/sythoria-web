import { z } from "zod";
import type { Conversation, SearchApiConfig } from "@/lib/types";
import { logError } from "./logger";

const ToolCallSchema = z.object({
  id: z.string(),
  name: z.string(),
  arguments: z.record(z.string(), z.unknown()),
});

const ToolCallResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
});

const SourceSchema = z.object({
  title: z.string(),
  url: z.string(),
});

const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "tool"]),
  content: z.string(),
  timestamp: z.coerce.date(),
  isStreaming: z.boolean().optional(),
  toolCall: ToolCallSchema.optional(),
  toolResult: ToolCallResultSchema.optional(),
  sources: z.array(SourceSchema).optional(),
  thoughtProcess: z.string().optional(),
});

const ConversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  timestamp: z.coerce.date(),
  messages: z.array(MessageSchema),
  model: z.string(),
  systemPromptId: z.string().optional(),
});

const ConversationsArraySchema = z.array(ConversationSchema);

const SearchConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.enum(["google", "searxng", "firecrawl", "custom"]),
  baseUrl: z.string(),
  apiKey: z.string().optional(),
  cx: z.string().optional(),
  maxResults: z.number(),
  enabled: z.boolean(),
});

const SearchConfigsArraySchema = z.array(SearchConfigSchema);

const CONVERSATIONS_KEY = "sythoria-conversations";
const THEME_KEY = "sythoria-theme";
const API_KEYS_KEY = "sythoria-api-keys";
const CONFIG_KEY = "sythoria-model-configs";
const SEARCH_CONFIGS_KEY = "sythoria-search-configs";
const SEARCH_API_KEYS_KEY = "sythoria-search-api-keys";

function parseConversations(raw: unknown): Conversation[] {
  const result = ConversationsArraySchema.safeParse(raw);
  if (result.success) return result.data as Conversation[];
  logError("Stored conversations failed validation, resetting", result.error);
  return [];
}

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (raw) return parseConversations(JSON.parse(raw));
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

export function loadSearchConfigs(): SearchApiConfig[] | null {
  try {
    const raw = localStorage.getItem(SEARCH_CONFIGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const result = SearchConfigsArraySchema.safeParse(parsed);
      if (result.success) return result.data as SearchApiConfig[];
      logError("Stored search configs failed validation", result.error);
    }
  } catch (e) {
    logError("Failed to load search configs from localStorage", e);
  }
  return null;
}

export function saveSearchConfigs(configs: SearchApiConfig[]): void {
  try {
    localStorage.setItem(SEARCH_CONFIGS_KEY, JSON.stringify(configs));
  } catch (e) {
    logError("Failed to save search configs to localStorage", e);
  }
}

export function loadSearchApiKeys(): Record<string, string> {
  try {
    const raw = localStorage.getItem(SEARCH_API_KEYS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) return parsed as Record<string, string>;
    }
  } catch (e) {
    logError("Failed to load search API keys", e);
  }
  return {};
}

export function saveSearchApiKeys(keys: Record<string, string>): void {
  try {
    localStorage.setItem(SEARCH_API_KEYS_KEY, JSON.stringify(keys));
  } catch (e) {
    logError("Failed to save search API keys", e);
  }
}
