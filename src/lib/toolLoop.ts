import type { Conversation, Message, ModelConfig, SearchApiConfig, SearchResult, UrlContent } from "@/lib/types";
import { generateId } from "@/utils/generateId";
import { logError } from "@/utils/logger";
import { MAX_TOOL_STEPS } from "@/lib/config";
import { parseApiError } from "@/components/chat/ui/Toast";
import { chatCompletionTools } from "@/lib/api";

export type LoadingKey = "init" | "sendMessage" | "checkConnection" | "saveConfig" | "toolExecution";

export interface AppState {
  conversations: Conversation[];
  activeId: string | null;
  isStreaming: boolean;
  loading: Record<LoadingKey, boolean>;
  addToast: (message: string, variant?: "error" | "success" | "info") => void;
  persistConversations: () => void;
}

export const TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "search_query",
      description:
        "Search the web for information. Returns search results with titles, URLs, and snippets. Use this when you need current or factual information.",
      parameters: {
        type: "object" as const,
        properties: {
          query: { type: "string" as const, description: "The search query string" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "fetch_url",
      description:
        "Fetch and extract the readable content of a web page. Use this when you want to read the full content of a URL found in search results.",
      parameters: {
        type: "object" as const,
        properties: {
          url: { type: "string" as const, description: "The URL to fetch and read" },
        },
        required: ["url"],
      },
    },
  },
];

export const TOOL_SYSTEM_PROMPT = `You have access to the following tools:

- search_query(query: string): Search the web for information. Returns search results with titles, URLs, and snippets.
- fetch_url(url: string): Fetch and extract the content of a web page.

When you need current information, facts, or recent events, use search_query first. If a search result looks relevant, use fetch_url to read the full page content. After gathering information, synthesize it into your final answer. Always cite your sources by mentioning where you found the information.`;

type KnownToolName = "search_query" | "fetch_url";
const KNOWN_TOOLS: Set<string> = new Set(["search_query", "fetch_url"]);

function toKnownToolName(name: string): KnownToolName | "unknown" {
  return KNOWN_TOOLS.has(name) ? (name as KnownToolName) : "unknown";
}

interface ToolCallData {
  id: string;
  function: { name: string; arguments: string };
}

interface ToolCallResponse {
  choices?: { message: { content: string | null; tool_calls?: ToolCallData[] } }[];
}

function updateConversationMessages(
  conversations: Conversation[],
  convId: string,
  updater: (msgs: Message[]) => Message[],
  extra?: Partial<Conversation>,
): Conversation[] {
  return conversations.map((c) => {
    if (c.id !== convId) return c;
    return { ...c, messages: updater(c.messages), timestamp: new Date(), ...extra };
  });
}

function setAssistantError(conversations: Conversation[], convId: string, err: unknown): Conversation[] {
  const friendlyMessage = parseApiError(err);
  return updateConversationMessages(conversations, convId, (msgs) => {
    const updated = [...msgs];
    const last = updated[updated.length - 1];
    if (last && last.role === "assistant") {
      updated[updated.length - 1] = { ...last, content: `**Error:** ${friendlyMessage}`, isStreaming: false };
    }
    return updated;
  });
}

export async function sendWithToolLoop(
  convId: string,
  modelConfig: ModelConfig,
  temperature: number,
  apiKeys: Record<string, string>,
  searchConfig: SearchApiConfig,
  searchApiKey: string,
  set: (fn: (state: AppState) => Partial<AppState>) => void,
  get: () => AppState,
  performSearch: (query: string, config: SearchApiConfig, apiKey: string) => Promise<SearchResult[]>,
  fetchUrlContent: (url: string) => Promise<UrlContent>,
  abortSignal?: AbortSignal,
) {
  set((state) => ({
    isStreaming: true,
    loading: { ...state.loading, sendMessage: true, toolExecution: false },
  }));

  const collectedSources: { title: string; url: string }[] = [];

  try {
    const apiUrl = modelConfig.apiBase;
    const apiKey = apiKeys[modelConfig.id] || modelConfig.apiKey;

    const conv = get().conversations.find((c) => c.id === convId);
    const baseMessages =
      conv?.messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content })) ?? [];

    const apiMessages: {
      role: string;
      content: string | null;
      tool_calls?: unknown[];
      tool_call_id?: string;
      name?: string;
    }[] = [{ role: "system", content: TOOL_SYSTEM_PROMPT }, ...baseMessages];

    for (let step = 0; step < MAX_TOOL_STEPS; step++) {
      if (abortSignal?.aborted) break;
      set((state) => ({ loading: { ...state.loading, toolExecution: true } }));

      const response = await chatCompletionTools({
        apiBase: apiUrl,
        apiKey,
        model: modelConfig.modelId,
        messages: apiMessages,
        tools: TOOL_DEFINITIONS,
        temperature,
        signal: abortSignal,
      });

      const choice = response.choices?.[0];
      if (!choice) break;

      const msg = choice.message;

      if (msg.tool_calls && msg.tool_calls.length > 0) {
        if (msg.content && msg.content.trim().length > 0) {
          const thoughtMsg: Message = {
            id: generateId(),
            role: "assistant",
            content: msg.content,
            timestamp: new Date(),
            thoughtProcess: msg.content,
          };
          set((state) => ({
            conversations: updateConversationMessages(state.conversations, convId, (msgs) => [...msgs, thoughtMsg]),
          }));
        }
        apiMessages.push({ role: "assistant", content: null, tool_calls: msg.tool_calls });

        for (const toolCall of msg.tool_calls) {
          const rawName = toolCall.function.name;
          const fnName = toKnownToolName(rawName);
          let fnArgs: Record<string, string>;
          try {
            fnArgs = JSON.parse(toolCall.function.arguments || "{}");
          } catch {
            fnArgs = {};
          }

          if (fnName === "unknown") {
            const unknownMsg: Message = {
              id: generateId(),
              role: "tool",
              content: `Unknown tool: ${rawName}`,
              timestamp: new Date(),
              toolCall: {
                id: toolCall.id,
                name: "fetch_url",
                arguments: { url: `unknown:${rawName}` },
              },
              toolResult: {
                id: toolCall.id,
                name: rawName,
                content: JSON.stringify({ error: `Unknown tool: ${rawName}` }),
              },
            };
            set((state) => ({
              conversations: updateConversationMessages(state.conversations, convId, (msgs) => [...msgs, unknownMsg]),
            }));
            apiMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              name: rawName,
              content: JSON.stringify({ error: `Unknown tool: ${rawName}` }),
            });
            continue;
          }

          const toolCallMsgId = generateId();
          const toolCallMsg: Message = {
            id: toolCallMsgId,
            role: "tool",
            content: fnName === "search_query" ? `Searching: ${fnArgs.query}` : `Fetching: ${fnArgs.url}`,
            timestamp: new Date(),
            toolCall: {
              id: toolCall.id,
              name: fnName,
              arguments: fnArgs,
            },
          };

          set((state) => ({
            conversations: updateConversationMessages(state.conversations, convId, (msgs) => [...msgs, toolCallMsg]),
          }));

          let resultContent = "";

          if (fnName === "search_query") {
            const results = await performSearch(fnArgs.query!, searchConfig, searchApiKey);
            resultContent = JSON.stringify(results);
            results.forEach((r) => collectedSources.push({ title: r.title, url: r.url }));

            const displayContent = results.map((r) => `[${r.title}](${r.url}): ${r.snippet}`).join("\n");

            set((state) => ({
              conversations: updateConversationMessages(state.conversations, convId, (msgs) =>
                msgs.map((m) =>
                  m.id === toolCallMsgId
                    ? {
                        ...m,
                        content: displayContent,
                        toolResult: {
                          id: toolCall.id,
                          name: "search_query",
                          content: resultContent,
                        },
                      }
                    : m,
                ),
              ),
            }));
          } else if (fnName === "fetch_url") {
            const urlContent = await fetchUrlContent(fnArgs.url!);
            resultContent = JSON.stringify(urlContent);
            if (urlContent.status === "ok") {
              collectedSources.push({ title: urlContent.title || fnArgs.url!, url: fnArgs.url! });
            }

            const displayContent =
              urlContent.status === "ok"
                ? urlContent.content.slice(0, 2000)
                : `Error fetching URL: ${urlContent.error || "Unknown error"}`;

            set((state) => ({
              conversations: updateConversationMessages(state.conversations, convId, (msgs) =>
                msgs.map((m) =>
                  m.id === toolCallMsgId
                    ? {
                        ...m,
                        content: displayContent,
                        toolResult: {
                          id: toolCall.id,
                          name: "fetch_url",
                          content: resultContent,
                        },
                      }
                    : m,
                ),
              ),
            }));
          }

          apiMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: fnName,
            content: resultContent,
          });
        }
      } else {
        const assistantContent = msg.content || "";

        const assistantMsg: Message = {
          id: generateId(),
          role: "assistant",
          content: assistantContent,
          timestamp: new Date(),
          isStreaming: false,
          sources: collectedSources.length > 0 ? collectedSources : undefined,
        };

        set((state) => ({
          conversations: updateConversationMessages(state.conversations, convId, (msgs) => [...msgs, assistantMsg]),
          isStreaming: false,
          loading: { ...state.loading, sendMessage: false, toolExecution: false },
        }));

        get().persistConversations();
        return;
      }
    }

    const maxStepsMsg: Message = {
      id: generateId(),
      role: "assistant",
      content:
        "I reached the maximum number of tool calls. Let me provide the best answer I can with the information gathered so far.",
      timestamp: new Date(),
      sources: collectedSources.length > 0 ? collectedSources : undefined,
    };

    set((state) => ({
      conversations: updateConversationMessages(state.conversations, convId, (msgs) => [...msgs, maxStepsMsg]),
      isStreaming: false,
      loading: { ...state.loading, sendMessage: false, toolExecution: false },
    }));

    get().persistConversations();
  } catch (err) {
    const friendlyMessage = parseApiError(err);
    set((state) => ({
      conversations: setAssistantError(state.conversations, convId, err),
      isStreaming: false,
      loading: { ...state.loading, sendMessage: false, toolExecution: false },
    }));
    get().addToast(friendlyMessage, "error");
    logError("Tool loop failed", err);
  }
}
