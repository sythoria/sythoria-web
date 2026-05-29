export type MessageRole = "user" | "assistant" | "tool";

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface UrlContent {
  url: string;
  title: string;
  content: string;
  status: string;
  error?: string;
}

export interface ToolCall {
  id: string;
  name: "search_query" | "fetch_url";
  arguments: Record<string, string>;
}

export interface ToolCallResult {
  id: string;
  name: string;
  content: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  toolCall?: ToolCall;
  toolResult?: ToolCallResult;
  sources?: { title: string; url: string }[];
  thoughtProcess?: string;
}

export interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
  model: string;
  systemPromptId?: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  apiBase: string;
  apiKey: string;
  modelId: string;
  provider?: string;
}

export type SearchProvider = "google" | "searxng" | "firecrawl" | "custom";

export interface SearchApiConfig {
  id: string;
  name: string;
  provider: SearchProvider;
  baseUrl: string;
  apiKey?: string;
  cx?: string;
  maxResults: number;
  enabled: boolean;
}

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export const STATUS_COLORS: Record<ConnectionStatus, string> = {
  disconnected: "bg-gray-400",
  connecting: "bg-yellow-400 animate-pulse",
  connected: "bg-green-500",
  error: "bg-red-500",
};

export type ModelStatuses = Record<string, ConnectionStatus>;

export type GenerationState =
  | "idle"
  | "thinking"
  | "searching"
  | "fetching"
  | "responding"
  | "error";
