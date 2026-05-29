import { create } from "zustand";
import type {
  Conversation,
  Message,
  ModelConfig,
  GenerationState,
} from "@/lib/types";
import {
  loadConversations,
  saveConversations,
  loadTheme,
  saveTheme,
  loadApiKeys,
  saveApiKeys,
  loadModelConfigs,
  loadSearchConfigs,
  loadSearchApiKeys,
  clearConversations,
} from "@/utils/storage";
import { generateId } from "@/utils/generateId";
import { logError, logInfo } from "@/utils/logger";
import { TITLE_MAX_LENGTH, DEFAULT_TEMPERATURE } from "@/lib/config";
import { PROVIDER_PRESETS } from "@/lib/config";
import { getSystemPrompt } from "@/config/systemPrompts";
import { parseApiError } from "@/components/chat/ui/Toast";
import { chatStream } from "@/lib/api";
import { sendWithToolLoop } from "@/lib/toolLoop";
import type { AppState as ToolLoopAppState } from "@/lib/toolLoop";
import {
  uiToast,
  uiLoading,
  uiConfigLoaded,
  uiHasStarted,
  uiTheme,
  uiSidebarOpen,
  uiView,
  uiCloseRenameModal,
  modelCheckConnections,
  modelStartHealthCheck,
  modelStopHealthCheck,
  modelSetState,
  searchSetState,
  searchPerformSearch,
  searchFetchUrlContent,
} from "./helpers";
import { useModelStore } from "./useModelStore";
import { useSearchStore } from "./useSearchStore";
import { useUIStore } from "./useUIStore";

let activeAbortController: AbortController | null = null;

function truncateTitle(text: string): string {
  return text.length > TITLE_MAX_LENGTH
    ? text.slice(0, TITLE_MAX_LENGTH) + "\u2026"
    : text;
}

function updateConversationMessages(
  conversations: Conversation[],
  convId: string,
  updater: (msgs: Message[]) => Message[],
  extra?: Partial<Conversation>
): Conversation[] {
  return conversations.map((c) => {
    if (c.id !== convId) return c;
    return {
      ...c,
      messages: updater(c.messages),
      timestamp: new Date(),
      ...extra,
    };
  });
}

function finalizeAssistantMessage(
  conversations: Conversation[],
  convId: string
): Conversation[] {
  return updateConversationMessages(conversations, convId, (msgs) => {
    const updated = [...msgs];
    const last = updated[updated.length - 1];
    if (last && last.role === "assistant" && last.isStreaming) {
      updated[updated.length - 1] = { ...last, isStreaming: false };
    }
    return updated;
  });
}

function setAssistantError(
  conversations: Conversation[],
  convId: string,
  err: unknown
): Conversation[] {
  const friendlyMessage = parseApiError(err);
  return updateConversationMessages(conversations, convId, (msgs) => {
    const updated = [...msgs];
    const last = updated[updated.length - 1];
    if (last && last.role === "assistant") {
      updated[updated.length - 1] = {
        ...last,
        content: `**Error:** ${friendlyMessage}`,
        isStreaming: false,
      };
    }
    return updated;
  });
}

export type LoadingKey =
  | "init"
  | "sendMessage"
  | "checkConnection"
  | "saveConfig"
  | "toolExecution";

interface ChatState {
  conversations: Conversation[];
  activeId: string | null;
  isStreaming: boolean;
  generationState: GenerationState;
  generationLabel: string;

  init: () => void;
  cleanupEmptyConversations: () => void;
  setActiveId: (id: string | null) => void;
  newChat: () => string;
  deleteChat: (id: string) => void;
  renameChat: (id: string, newTitle: string) => void;
  confirmRename: (newTitle: string) => void;
  sendMessage: (text: string) => Promise<void>;
  retryLastMessage: (convId: string) => Promise<void>;
  stopStreaming: () => void;
  exportChat: (id: string) => void;
  persistConversations: () => void;
  clearAllChats: () => void;
  cleanup: () => void;
  setGenerationState: (
    state: GenerationState,
    label?: string,
    error?: string
  ) => void;
}

let initInProgress = false;

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeId: null,
  isStreaming: false,
  generationState: "idle" as GenerationState,
  generationLabel: "",

  init: () => {
    if (initInProgress) return;
    initInProgress = true;
    uiLoading("init", true);
    try {
      const loadedModels = loadModelConfigs();
      const loadedConvs = loadConversations();
      const loadedTheme = loadTheme();
      const loadedKeys = loadApiKeys();
      const loadedSearchConfigs = loadSearchConfigs();
      const loadedSearchKeys = loadSearchApiKeys();

      const models = (loadedModels || []) as ModelConfig[];
      const modelsWithKeys = models.map((m: ModelConfig) => ({
        ...m,
        apiKey: loadedKeys[m.id] ?? m.apiKey,
      }));

      const nonEmptyConvs = loadedConvs.filter(
        (c: Conversation) => c.messages.length > 0
      );

      const searchConfigs = loadedSearchConfigs || [];

      if (modelsWithKeys.length === 0) {
        const defaultModel: ModelConfig = {
          id: "default-openai",
          name: "OpenAI",
          apiBase: PROVIDER_PRESETS[0].apiBase,
          apiKey: "",
          modelId: PROVIDER_PRESETS[0].defaultModel,
          provider: PROVIDER_PRESETS[0].label,
        };
        modelsWithKeys.push(defaultModel);
      }

      modelSetState({
        models: modelsWithKeys,
        selectedModel: modelsWithKeys.length > 0 ? modelsWithKeys[0].id : "",
        apiKeys: loadedKeys,
        modelStatuses: {},
      });

      searchSetState({
        searchConfigs,
        activeSearchId:
          searchConfigs.find((c: { enabled: boolean }) => c.enabled)?.id ??
          null,
        searchApiKeys: loadedSearchKeys,
      });

      set({
        conversations: nonEmptyConvs,
        activeId: nonEmptyConvs.length > 0 ? nonEmptyConvs[0].id : null,
      });

      uiHasStarted(modelsWithKeys.length > 0);
      uiConfigLoaded(true);
      uiTheme(loadedTheme);

      document.documentElement.classList.toggle("dark", loadedTheme === "dark");
      logInfo("App state initialized");

      modelCheckConnections();
      modelStartHealthCheck();
    } catch (err) {
      logError("Failed to initialize app", err);
      uiToast(parseApiError(err), "error");
      uiConfigLoaded(true);
    } finally {
      uiLoading("init", false);
      initInProgress = false;
    }
  },

  cleanupEmptyConversations: () => {
    const { conversations, activeId } = get();
    const nonEmpty = conversations.filter((c) => c.messages.length > 0);
    if (nonEmpty.length === conversations.length) return;
    const activeRemoved = activeId && !nonEmpty.find((c) => c.id === activeId);
    set({
      conversations: nonEmpty,
      ...(activeRemoved
        ? { activeId: nonEmpty.length > 0 ? nonEmpty[0].id : null }
        : {}),
    });
  },

  setActiveId: (id) => {
    const { activeId } = get();
    if (activeId === id) return;
    get().cleanupEmptyConversations();
    set({ activeId: id });
  },

  newChat: () => {
    const { selectedModel, models } = useModelStore.getState();
    const id = generateId();
    const modelConfig = models.find((m) => m.id === selectedModel);
    const { systemPromptId } = useUIStore.getState();
    const conv: Conversation = {
      id,
      title: "New chat",
      timestamp: new Date(),
      messages: [],
      model: modelConfig?.id || selectedModel,
      systemPromptId: systemPromptId ?? undefined,
    };
    set((state) => ({
      conversations: [conv, ...state.conversations],
      activeId: id,
    }));
    uiSidebarOpen(false);
    uiView("chat");
    return id;
  },

  deleteChat: (id) => {
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      activeId: state.activeId === id ? null : state.activeId,
    }));
    get().persistConversations();
  },

  renameChat: (id, newTitle) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, title: newTitle } : c
      ),
    }));
    get().persistConversations();
  },

  confirmRename: (newTitle) => {
    const { renameId } = useUIStore.getState();
    if (renameId) {
      get().renameChat(renameId, newTitle);
    }
    uiCloseRenameModal();
  },

  sendMessage: async (text) => {
    const { isStreaming, activeId, conversations } = get();
    const { selectedModel, models, temperature, apiKeys } =
      useModelStore.getState();
    const { isSearchEnabled, activeSearchId, searchConfigs, searchApiKeys } =
      useSearchStore.getState();
    const { systemPromptId } = useUIStore.getState();

    if (isStreaming) return;

    let convId = activeId;
    let isFirstMessage = false;

    if (!convId) {
      const id = generateId();
      const modelConfig = models.find((m) => m.id === selectedModel);
      const conv: Conversation = {
        id,
        title: truncateTitle(text),
        timestamp: new Date(),
        messages: [],
        model: modelConfig?.id || selectedModel,
        systemPromptId: systemPromptId ?? undefined,
      };
      set((state) => ({
        conversations: [conv, ...state.conversations],
        activeId: id,
      }));
      convId = id;
      isFirstMessage = true;
    } else {
      const existing = conversations.find((c) => c.id === convId);
      if (existing && existing.messages.length === 0) {
        isFirstMessage = true;
      }
    }

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const finalId = convId;
    const modelConfig = models.find((m) => m.id === selectedModel) ?? models[0];

    if (!modelConfig) {
      logError("No model configuration selected");
      uiToast("No model configured — add one in Settings", "error");
      return;
    }

    const fallbackTitle = truncateTitle(text);

    set((state) => ({
      generationState: "idle" as GenerationState,
      generationLabel: "",
      conversations: updateConversationMessages(
        state.conversations,
        finalId,
        (msgs) => [...msgs, userMsg],
        { title: isFirstMessage ? fallbackTitle : undefined }
      ),
    }));

    const useTools = isSearchEnabled && activeSearchId;
    const searchConfig = useTools
      ? searchConfigs.find((c) => c.id === activeSearchId)
      : undefined;
    const searchApiKey =
      useTools && searchConfig
        ? searchApiKeys[searchConfig.id] || searchConfig.apiKey || ""
        : "";

    if (useTools && searchConfig) {
      const abortController = new AbortController();
      activeAbortController = abortController;

      await sendWithToolLoop(
        finalId,
        modelConfig,
        temperature,
        apiKeys,
        searchConfig,
        searchApiKey,
        (fn) => set(fn as (state: ChatState) => Partial<ChatState>),
        () => get() as unknown as ToolLoopAppState,
        searchPerformSearch,
        searchFetchUrlContent,
        uiToast,
        () => get().persistConversations(),
        abortController.signal
      );
      activeAbortController = null;
    } else {
      await sendNormal(
        finalId,
        modelConfig,
        temperature,
        apiKeys,
        systemPromptId,
        set,
        get
      );
    }
  },

  stopStreaming: () => {
    if (activeAbortController) {
      activeAbortController.abort();
      activeAbortController = null;
    }
    set((state) => {
      const convs = state.conversations.map((c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.isStreaming ? { ...m, isStreaming: false } : m
        ),
      }));
      return {
        isStreaming: false,
        generationState: "idle" as GenerationState,
        generationLabel: "",
        conversations: convs,
      };
    });
    uiLoading("sendMessage", false);
    uiLoading("toolExecution", false);
  },

  retryLastMessage: async (convId) => {
    const { isStreaming, conversations } = get();
    const { selectedModel, models, temperature, apiKeys } =
      useModelStore.getState();
    const { isSearchEnabled, activeSearchId, searchConfigs, searchApiKeys } =
      useSearchStore.getState();
    const { systemPromptId } = useUIStore.getState();

    if (isStreaming) return;

    const conv = conversations.find((c) => c.id === convId);
    if (!conv || conv.messages.length === 0) return;

    let lastUserIdx = -1;
    for (let i = conv.messages.length - 1; i >= 0; i--) {
      if (conv.messages[i].role === "user") {
        lastUserIdx = i;
        break;
      }
    }
    if (lastUserIdx === -1) return;

    const lastUserMsg = conv.messages[lastUserIdx];
    const trimmed = conv.messages.slice(0, lastUserIdx);

    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === convId ? { ...c, messages: trimmed, timestamp: new Date() } : c
      ),
    }));

    const modelConfig = models.find((m) => m.id === selectedModel) ?? models[0];
    if (!modelConfig) {
      logError("No model configuration selected");
      uiToast("No model configured — add one in Settings", "error");
      return;
    }

    const useTools = isSearchEnabled && activeSearchId;
    const searchConfig = useTools
      ? searchConfigs.find((c) => c.id === activeSearchId)
      : undefined;
    const searchApiKey =
      useTools && searchConfig
        ? searchApiKeys[searchConfig.id] || searchConfig.apiKey || ""
        : "";

    set((state) => ({
      conversations: updateConversationMessages(
        state.conversations,
        convId,
        (msgs) => [...msgs, lastUserMsg]
      ),
    }));

    if (useTools && searchConfig) {
      const abortController = new AbortController();
      activeAbortController = abortController;

      await sendWithToolLoop(
        convId,
        modelConfig,
        temperature,
        apiKeys,
        searchConfig,
        searchApiKey,
        (fn) => set(fn as (state: ChatState) => Partial<ChatState>),
        () => get() as unknown as ToolLoopAppState,
        searchPerformSearch,
        searchFetchUrlContent,
        uiToast,
        () => get().persistConversations(),
        abortController.signal
      );
      activeAbortController = null;
    } else {
      await sendNormal(
        convId,
        modelConfig,
        temperature,
        apiKeys,
        systemPromptId,
        set,
        get
      );
    }
  },

  exportChat: (id) => {
    const conv = get().conversations.find((c) => c.id === id);
    if (!conv) return;
    const lines = [
      `# ${conv.title}`,
      ``,
      ...conv.messages.map((m) => {
        if (m.role === "tool") {
          const result = m.toolResult;
          return `**Tool (${result?.name ?? "unknown"}):** ${m.content.slice(0, 200)}`;
        }
        const label = m.role === "user" ? "You" : "Assistant";
        return `**${label}:** ${m.content}`;
      }),
    ];
    const blob = new Blob([lines.join("\n\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${conv.title.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    uiToast("Chat exported", "success");
  },

  persistConversations: () => {
    const { hasStarted } = useUIStore.getState();
    if (!hasStarted) return;
    get().cleanupEmptyConversations();
    const { conversations } = get();
    saveConversations(conversations);
  },

  clearAllChats: () => {
    set({ conversations: [], activeId: null });
    clearConversations();
    uiToast("All chats cleared", "info");
  },

  cleanup: () => {
    modelStopHealthCheck();
    get().stopStreaming();
  },

  setGenerationState: (state, label, error) => {
    set({
      generationState: state,
      generationLabel: error ? `${label ?? state}: ${error}` : (label ?? state),
    });
  },
}));

async function sendNormal(
  convId: string,
  modelConfig: ModelConfig,
  temperature: number,
  apiKeys: Record<string, string>,
  systemPromptId: string | null,
  set: (fn: (state: ChatState) => Partial<ChatState>) => void,
  get: () => ChatState
) {
  const assistantMsg: Message = {
    id: generateId(),
    role: "assistant",
    content: "",
    timestamp: new Date(),
    isStreaming: true,
  };

  set((state) => ({
    isStreaming: true,
    generationState: "thinking" as GenerationState,
    generationLabel: "Thinking",
    conversations: updateConversationMessages(
      state.conversations,
      convId,
      (msgs) => [...msgs, assistantMsg]
    ),
  }));
  uiLoading("sendMessage", true);

  const abortController = new AbortController();
  activeAbortController = abortController;

  try {
    const apiUrl = modelConfig.apiBase;
    const apiKey = apiKeys[modelConfig.id] || modelConfig.apiKey;

    const conv = get().conversations.find((c) => c.id === convId);
    const promptId = conv?.systemPromptId ?? systemPromptId;
    const systemContent = promptId ? getSystemPrompt(promptId) : undefined;

    const apiMessages: { role: string; content: string }[] = [];
    if (systemContent) {
      apiMessages.push({ role: "system", content: systemContent });
    }
    apiMessages.push(
      ...(conv?.messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role,
          content: m.content,
        })) ?? [])
    );

    await chatStream({
      apiBase: apiUrl,
      apiKey,
      model: modelConfig.modelId,
      messages: apiMessages,
      temperature,
      signal: abortController.signal,
      onChunk: (delta) => {
        set((state) => {
          const newState: Partial<ChatState> = {};
          if (state.generationState === "thinking") {
            newState.generationState = "responding";
            newState.generationLabel = "Responding";
          }
          return {
            ...newState,
            conversations: state.conversations.map((c) => {
              if (c.id !== convId) return c;
              const updated = [...c.messages];
              const last = updated[updated.length - 1];
              if (last && last.role === "assistant") {
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + delta,
                };
              }
              return { ...c, messages: updated };
            }),
          };
        });
      },
      onDone: () => {
        set((state) => ({
          conversations: finalizeAssistantMessage(state.conversations, convId),
          isStreaming: false,
          generationState: "idle" as GenerationState,
          generationLabel: "",
        }));
        activeAbortController = null;
        uiLoading("sendMessage", false);
        get().persistConversations();
      },
      onError: (err) => {
        const friendlyMessage = parseApiError(err);
        set((state) => ({
          conversations: setAssistantError(state.conversations, convId, err),
          isStreaming: false,
          generationState: "error" as GenerationState,
          generationLabel: `Generation failed: ${friendlyMessage}`,
        }));
        activeAbortController = null;
        uiLoading("sendMessage", false);
        uiToast(friendlyMessage, "error");
        logError("Failed to send message", err);
      },
    });
  } catch (err) {
    const friendlyMessage = parseApiError(err);
    set((state) => ({
      conversations: setAssistantError(state.conversations, convId, err),
      isStreaming: false,
      generationState: "error" as GenerationState,
      generationLabel: `Generation failed: ${friendlyMessage}`,
    }));
    activeAbortController = null;
    uiLoading("sendMessage", false);
    uiToast(friendlyMessage, "error");
    logError("Failed to send message", err);
  }
}
