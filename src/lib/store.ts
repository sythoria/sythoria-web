import { create } from "zustand";
import type { Conversation, Message, ModelConfig, ConnectionStatus, ModelStatuses, SearchApiConfig, SearchResult, UrlContent } from "@/lib/types";
import { STATUS_COLORS } from "@/lib/types";
import {
  loadConversations,
  saveConversations,
  loadTheme,
  saveTheme,
  loadApiKeys,
  saveApiKeys,
  clearConversations,
  loadModelConfigs,
  saveModelConfigs,
  loadSearchConfigs,
  saveSearchConfigs,
  loadSearchApiKeys,
  saveSearchApiKeys,
} from "@/utils/storage";
import { generateId } from "@/utils/generateId";
import { logError, logInfo } from "@/utils/logger";
import { TITLE_MAX_LENGTH, DEFAULT_TEMPERATURE } from "@/lib/config";
import { getSystemPrompt } from "@/config/systemPrompts";
import { parseApiError } from "@/components/chat/ui/Toast";
import type { Toast } from "@/components/chat/ui/Toast";
import { validateModelConfig, validateSearchConfig } from "@/utils/validation";
import { chatStream, checkApiConnection } from "@/lib/api";
import { PROVIDER_PRESETS } from "@/lib/config";
import { sendWithToolLoop, type LoadingKey as ToolLoopLoadingKey } from "@/lib/toolLoop";

let activeAbortController: AbortController | null = null;
let healthCheckInterval: ReturnType<typeof setInterval> | null = null;

function truncateTitle(text: string): string {
  return text.length > TITLE_MAX_LENGTH ? text.slice(0, TITLE_MAX_LENGTH) + "\u2026" : text;
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

function finalizeAssistantMessage(conversations: Conversation[], convId: string): Conversation[] {
  return updateConversationMessages(conversations, convId, (msgs) => {
    const updated = [...msgs];
    const last = updated[updated.length - 1];
    if (last && last.role === "assistant" && last.isStreaming) {
      updated[updated.length - 1] = { ...last, isStreaming: false };
    }
    return updated;
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

export type LoadingKey = ToolLoopLoadingKey;

interface AppState {
  conversations: Conversation[];
  activeId: string | null;
  models: ModelConfig[];
  selectedModel: string;
  temperature: number;
  sidebarOpen: boolean;
  isStreaming: boolean;
  modelStatuses: ModelStatuses;
  hasStarted: boolean;
  isConfigLoaded: boolean;
  view: "chat" | "settings";
  theme: "light" | "dark";
  apiKeys: Record<string, string>;
  showRenameModal: boolean;
  renameId: string | null;
  renameCurrentTitle: string;
  systemPromptId: string | null;
  loading: Record<LoadingKey, boolean>;
  toasts: Toast[];
  searchConfigs: SearchApiConfig[];
  activeSearchId: string | null;
  isSearchEnabled: boolean;
  searchApiKeys: Record<string, string>;

  init: () => void;
  setSystemPromptId: (id: string | null) => void;
  cleanupEmptyConversations: () => void;
  setActiveId: (id: string | null) => void;
  setSelectedModel: (model: string) => void;
  setTemperature: (t: number) => void;
  setSidebarOpen: (open: boolean) => void;
  setView: (view: "chat" | "settings") => void;
  setTheme: (theme: "light" | "dark") => void;
  setHasStarted: (started: boolean) => void;
  addToast: (message: string, variant?: Toast["variant"]) => void;
  dismissToast: (id: string) => void;
  updateModel: (id: string, updates: Partial<ModelConfig>) => void;
  deleteModel: (id: string) => void;
  addModel: () => void;
  newChat: () => string;
  deleteChat: (id: string) => void;
  renameChat: (id: string, newTitle: string) => void;
  openRenameModal: (id: string, currentTitle: string) => void;
  closeRenameModal: () => void;
  confirmRename: (newTitle: string) => void;
  sendMessage: (text: string) => Promise<void>;
  retryLastMessage: (convId: string) => Promise<void>;
  stopStreaming: () => void;
  exportChat: (id: string) => void;
  persistConversations: () => void;
  clearAllChats: () => void;
  checkModelConnections: (modelIds?: string[]) => Promise<void>;
  startHealthCheck: () => void;
  stopHealthCheck: () => void;
  cleanup: () => void;
  addSearchConfig: () => void;
  updateSearchConfig: (id: string, updates: Partial<SearchApiConfig>) => void;
  deleteSearchConfig: (id: string) => void;
  setActiveSearchId: (id: string | null) => void;
  toggleSearchEnabled: (enabled: boolean) => void;
  performSearch: (query: string, config: SearchApiConfig, apiKey: string) => Promise<SearchResult[]>;
  fetchUrlContent: (url: string) => Promise<UrlContent>;
}

let toastCounter = 0;

export const useAppStore = create<AppState>((set, get) => ({
  conversations: [],
  activeId: null,
  models: [],
  selectedModel: "",
  temperature: DEFAULT_TEMPERATURE,
  sidebarOpen: false,
  isStreaming: false,
  modelStatuses: {},
  hasStarted: false,
  isConfigLoaded: false,
  view: "chat",
  theme: "dark",
  apiKeys: {},
  showRenameModal: false,
  renameId: null,
  renameCurrentTitle: "",
  loading: { init: true, sendMessage: false, checkConnection: false, saveConfig: false, toolExecution: false },
  toasts: [],
  systemPromptId: null,
  searchConfigs: [],
  activeSearchId: null,
  isSearchEnabled: false,
  searchApiKeys: {},

  init: () => {
    set((s) => ({ loading: { ...s.loading, init: true } }));
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

      const nonEmptyConvs = loadedConvs.filter((c: Conversation) => c.messages.length > 0);

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
        saveModelConfigs(modelsWithKeys.map(({ apiKey: _k, ...rest }) => rest));
      }

      set({
        models: modelsWithKeys,
        selectedModel: modelsWithKeys[0].id,
        conversations: nonEmptyConvs,
        activeId: nonEmptyConvs.length > 0 ? nonEmptyConvs[0].id : null,
        theme: loadedTheme,
        apiKeys: loadedKeys,
        hasStarted: true,
        isConfigLoaded: true,
        searchConfigs,
        activeSearchId: searchConfigs.find((c) => c.enabled)?.id ?? null,
        searchApiKeys: loadedSearchKeys,
      });

      document.documentElement.classList.toggle("dark", loadedTheme === "dark");
      logInfo("App state initialized");

      get().checkModelConnections();
      get().startHealthCheck();
    } catch (err) {
      logError("Failed to initialize app", err);
      get().addToast(parseApiError(err), "error");
      set({ isConfigLoaded: true });
    } finally {
      set((s) => ({ loading: { ...s.loading, init: false } }));
    }
  },

  cleanupEmptyConversations: () => {
    const { conversations, activeId } = get();
    const nonEmpty = conversations.filter((c) => c.messages.length > 0);
    if (nonEmpty.length === conversations.length) return;
    const activeRemoved = activeId && !nonEmpty.find((c) => c.id === activeId);
    set({
      conversations: nonEmpty,
      ...(activeRemoved ? { activeId: nonEmpty.length > 0 ? nonEmpty[0].id : null } : {}),
    });
  },

  setActiveId: (id) => {
    const { activeId } = get();
    if (activeId === id) return;
    get().cleanupEmptyConversations();
    set({ activeId: id });
  },

  setSelectedModel: (model) => {
    set({ selectedModel: model });
    const { modelStatuses } = get();
    if (!modelStatuses[model]) {
      get().checkModelConnections([model]);
    }
  },

  setTemperature: (t) => set({ temperature: t }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setView: (view) => {
    get().cleanupEmptyConversations();
    set({ view });
  },

  setHasStarted: (started) => set({ hasStarted: started }),

  setSystemPromptId: (id) => {
    const { systemPromptId, activeId, conversations } = get();
    if (systemPromptId === id && !activeId) return;
    set({ systemPromptId: id });
    if (activeId) {
      const conv = conversations.find((c) => c.id === activeId);
      if (conv?.systemPromptId !== (id ?? undefined)) {
        set({
          conversations: conversations.map((c) => (c.id === activeId ? { ...c, systemPromptId: id ?? undefined } : c)),
        });
        get().persistConversations();
      }
    }
  },

  addToast: (message, variant = "info") => {
    const id = `toast-${++toastCounter}`;
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }));
  },

  dismissToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  setTheme: (theme) => {
    set({ theme });
    document.documentElement.classList.toggle("dark", theme === "dark");
    saveTheme(theme);
  },

  updateModel: (id, updates) => {
    const { models, apiKeys } = get();
    const updatedModels = models.map((m) => (m.id === id ? { ...m, ...updates } : m));
    set({ models: updatedModels });
    saveModelConfigs(updatedModels.map(({ apiKey: _apiKey, ...rest }) => rest as ModelConfig));

    if (updates.apiKey !== undefined) {
      const newKeys = { ...apiKeys, [id]: updates.apiKey };
      set({ apiKeys: newKeys });
      saveApiKeys(newKeys);
    }

    if (updates.apiBase || updates.apiKey !== undefined) {
      get().checkModelConnections([id]);
    }

    const { selectedModel } = get();
    if (!updatedModels.find((m) => m.id === selectedModel) && updatedModels.length > 0) {
      set({ selectedModel: updatedModels[0].id });
    }
  },

  deleteModel: (id) => {
    const { models, selectedModel, apiKeys, modelStatuses } = get();
    const updated = models.filter((m) => m.id !== id);
    const newKeys = { ...apiKeys };
    delete newKeys[id];
    const newStatuses = { ...modelStatuses };
    delete newStatuses[id];
    set({ models: updated, apiKeys: newKeys, modelStatuses: newStatuses });
    saveModelConfigs(updated.map(({ apiKey: _apiKey, ...rest }) => rest as ModelConfig));
    saveApiKeys(newKeys);
    if (selectedModel === id && updated.length > 0) {
      set({ selectedModel: updated[0].id });
    }
    get().addToast("Model deleted", "info");
  },

  addModel: () => {
    const newModel: ModelConfig = {
      id: "custom-" + Date.now(),
      name: "New Model",
      apiBase: "https://api.openai.com/v1/chat/completions",
      apiKey: "",
      modelId: "gpt-4o",
      provider: "OpenAI",
    };
    const { models } = get();
    const updated = [...models, newModel];
    set({ models: updated });
    saveModelConfigs(updated.map(({ apiKey: _apiKey, ...rest }) => rest as ModelConfig));
    get().checkModelConnections([newModel.id]);
    get().addToast("Model added \u2014 configure its details", "info");
  },

  newChat: () => {
    const { selectedModel, models, systemPromptId } = get();
    const id = generateId();
    const modelConfig = models.find((m) => m.id === selectedModel);
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
      sidebarOpen: false,
      view: "chat",
    }));
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
      conversations: state.conversations.map((c) => (c.id === id ? { ...c, title: newTitle } : c)),
    }));
    get().persistConversations();
  },

  openRenameModal: (id, currentTitle) => {
    set({ renameId: id, renameCurrentTitle: currentTitle, showRenameModal: true });
  },

  closeRenameModal: () => {
    set({ showRenameModal: false, renameId: null, renameCurrentTitle: "" });
  },

  confirmRename: (newTitle) => {
    const { renameId } = get();
    if (renameId) {
      get().renameChat(renameId, newTitle);
    }
    set({ showRenameModal: false, renameId: null, renameCurrentTitle: "" });
  },

  sendMessage: async (text) => {
    const {
      isStreaming,
      activeId,
      selectedModel,
      models,
      temperature,
      apiKeys,
      systemPromptId,
      isSearchEnabled,
      activeSearchId,
      searchConfigs,
      searchApiKeys,
    } = get();
    if (isStreaming) return;

    let convId = activeId;

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
    }

    const userMsg: Message = { id: generateId(), role: "user", content: text, timestamp: new Date() };

    const finalId = convId;
    const modelConfig = models.find((m) => m.id === selectedModel) ?? models[0];

    if (!modelConfig) {
      logError("No model configuration selected");
      get().addToast("No model configured — add one in Settings", "error");
      return;
    }

    const useTools = isSearchEnabled && activeSearchId;
    const searchConfig = useTools ? searchConfigs.find((c) => c.id === activeSearchId) : undefined;
    const searchApiKey = useTools && searchConfig ? searchApiKeys[searchConfig.id] || searchConfig.apiKey || "" : "";

    set((state) => ({
      conversations: updateConversationMessages(
        state.conversations,
        finalId,
        (msgs) => [...msgs, userMsg],
        {
          title:
            state.conversations.find((c) => c.id === finalId)?.messages.length === 0 ? truncateTitle(text) : undefined,
        },
      ),
    }));

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
          (fn) => set(fn as (state: AppState & Record<string, unknown>) => Partial<AppState & Record<string, unknown>>),
          () => get() as unknown as AppState,
          get().performSearch,
          get().fetchUrlContent,
          abortController.signal,
        );
      activeAbortController = null;
    } else {
      const assistantMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      set((state) => ({
        isStreaming: true,
        loading: { ...state.loading, sendMessage: true },
        conversations: updateConversationMessages(state.conversations, finalId, (msgs) => [...msgs, assistantMsg]),
      }));

      const abortController = new AbortController();
      activeAbortController = abortController;

      try {
        const apiUrl = modelConfig.apiBase;
        const apiKey = apiKeys[modelConfig.id] || modelConfig.apiKey;

        const conv = get().conversations.find((c) => c.id === finalId);
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
            })) ?? []),
        );
        apiMessages.push({ role: "user", content: text });

        await chatStream({
          apiBase: apiUrl,
          apiKey,
          model: modelConfig.modelId,
          messages: apiMessages,
          temperature,
          signal: abortController.signal,
          onChunk: (delta) => {
            set((state) => ({
              conversations: state.conversations.map((c) => {
                if (c.id !== finalId) return c;
                const updated = [...c.messages];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") {
                  updated[updated.length - 1] = { ...last, content: last.content + delta };
                }
                return { ...c, messages: updated };
              }),
            }));
          },
          onDone: () => {
            set((state) => ({
              conversations: finalizeAssistantMessage(state.conversations, finalId),
              isStreaming: false,
              loading: { ...state.loading, sendMessage: false },
            }));
            activeAbortController = null;
            get().persistConversations();
          },
          onError: (err) => {
            const friendlyMessage = parseApiError(err);
            set((state) => ({
              conversations: setAssistantError(state.conversations, finalId, err),
              isStreaming: false,
              loading: { ...state.loading, sendMessage: false },
            }));
            activeAbortController = null;
            get().addToast(friendlyMessage, "error");
            logError("Failed to send message", err);
          },
        });
      } catch (err) {
        const friendlyMessage = parseApiError(err);
        set((state) => ({
          conversations: setAssistantError(state.conversations, finalId, err),
          isStreaming: false,
          loading: { ...state.loading, sendMessage: false },
        }));
        activeAbortController = null;
        get().addToast(friendlyMessage, "error");
        logError("Failed to send message", err);
      }
    }
  },
  retryLastMessage: async (convId) => {
    const {
      isStreaming,
      conversations,
      models,
      selectedModel,
      temperature,
      apiKeys,
      systemPromptId,
      isSearchEnabled,
      activeSearchId,
      searchConfigs,
      searchApiKeys,
    } = get();
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
        c.id === convId ? { ...c, messages: trimmed, timestamp: new Date() } : c,
      ),
    }));

    const modelConfig = models.find((m) => m.id === selectedModel) ?? models[0];
    if (!modelConfig) {
      logError("No model configuration selected");
      get().addToast("No model configured — add one in Settings", "error");
      return;
    }

    const useTools = isSearchEnabled && activeSearchId;
    const searchConfig = useTools ? searchConfigs.find((c) => c.id === activeSearchId) : undefined;
    const searchApiKey = useTools && searchConfig ? searchApiKeys[searchConfig.id] || searchConfig.apiKey || "" : "";

    set((state) => ({
      conversations: updateConversationMessages(state.conversations, convId, (msgs) => [...msgs, lastUserMsg]),
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
        (fn) => set(fn as (state: AppState & Record<string, unknown>) => Partial<AppState & Record<string, unknown>>),
        () => get() as unknown as AppState,
        get().performSearch,
        get().fetchUrlContent,
        abortController.signal,
      );
      activeAbortController = null;
    } else {
      const assistantMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      set((state) => ({
        isStreaming: true,
        loading: { ...state.loading, sendMessage: true },
        conversations: updateConversationMessages(state.conversations, convId, (msgs) => [...msgs, assistantMsg]),
      }));

      const abortController = new AbortController();
      activeAbortController = abortController;

      try {
        const apiUrl = modelConfig.apiBase;
        const apiKey = apiKeys[modelConfig.id] || modelConfig.apiKey;

        const currentConv = get().conversations.find((c) => c.id === convId);
        const promptId = currentConv?.systemPromptId ?? systemPromptId;
        const systemContent = promptId ? getSystemPrompt(promptId) : undefined;

        const apiMessages: { role: string; content: string }[] = [];
        if (systemContent) {
          apiMessages.push({ role: "system", content: systemContent });
        }
        apiMessages.push(
          ...(currentConv?.messages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({
              role: m.role,
              content: m.content,
            })) ?? []),
        );

        await chatStream({
          apiBase: apiUrl,
          apiKey,
          model: modelConfig.modelId,
          messages: apiMessages,
          temperature,
          signal: abortController.signal,
          onChunk: (delta) => {
            set((state) => ({
              conversations: state.conversations.map((c) => {
                if (c.id !== convId) return c;
                const updated = [...c.messages];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") {
                  updated[updated.length - 1] = { ...last, content: last.content + delta };
                }
                return { ...c, messages: updated };
              }),
            }));
          },
          onDone: () => {
            set((state) => ({
              conversations: finalizeAssistantMessage(state.conversations, convId),
              isStreaming: false,
              loading: { ...state.loading, sendMessage: false },
            }));
            activeAbortController = null;
            get().persistConversations();
          },
          onError: (err) => {
            const friendlyMessage = parseApiError(err);
            set((state) => ({
              conversations: setAssistantError(state.conversations, convId, err),
              isStreaming: false,
              loading: { ...state.loading, sendMessage: false },
            }));
            activeAbortController = null;
            get().addToast(friendlyMessage, "error");
            logError("Failed to retry message", err);
          },
        });
      } catch (err) {
        const friendlyMessage = parseApiError(err);
        set((state) => ({
          conversations: setAssistantError(state.conversations, convId, err),
          isStreaming: false,
          loading: { ...state.loading, sendMessage: false },
        }));
        activeAbortController = null;
        get().addToast(friendlyMessage, "error");
        logError("Failed to retry message", err);
      }
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
        messages: c.messages.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)),
      }));
      return { isStreaming: false, loading: { ...state.loading, sendMessage: false, toolExecution: false }, conversations: convs };
    });
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
    get().addToast("Chat exported", "success");
  },

  persistConversations: () => {
    const { hasStarted } = get();
    if (!hasStarted) return;
    get().cleanupEmptyConversations();
    const { conversations } = get();
    saveConversations(conversations);
  },

  clearAllChats: () => {
    set({ conversations: [], activeId: null });
    clearConversations();
    get().addToast("All chats cleared", "info");
  },

  checkModelConnections: async (modelIds?: string[]) => {
    const { models, apiKeys, modelStatuses } = get();
    const toCheck = modelIds ? models.filter((m) => modelIds.includes(m.id)) : models;

    if (toCheck.length === 0) return;

    set((s) => ({ loading: { ...s.loading, checkConnection: true } }));

    const updating: ModelStatuses = { ...modelStatuses };
    for (const model of toCheck) {
      updating[model.id] = "connecting";
    }
    set({ modelStatuses: updating });

    const results = await Promise.allSettled(
      toCheck.map(async (model) => {
        const apiKey = apiKeys[model.id] || model.apiKey;
        try {
          const ok = await checkApiConnection(model.apiBase, apiKey);
          return { id: model.id, status: (ok ? "connected" : "error") as ConnectionStatus };
        } catch {
          return { id: model.id, status: "error" as ConnectionStatus };
        }
      }),
    );

    const newStatuses: ModelStatuses = { ...get().modelStatuses };
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const model = toCheck[i];
      if (result.status === "fulfilled") {
        newStatuses[model.id] = result.value.status;
      } else {
        newStatuses[model.id] = "error";
      }
    }

    set((s) => ({ modelStatuses: newStatuses, loading: { ...s.loading, checkConnection: false } }));
  },

  startHealthCheck: () => {
    if (healthCheckInterval) return;
    healthCheckInterval = setInterval(() => {
      get().checkModelConnections();
    }, 30000);
  },

  stopHealthCheck: () => {
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
      healthCheckInterval = null;
    }
  },

  cleanup: () => {
    get().stopHealthCheck();
    get().stopStreaming();
  },

  addSearchConfig: () => {
    const newConfig: SearchApiConfig = {
      id: "search-" + Date.now(),
      name: "New Search API",
      provider: "google",
      baseUrl: "https://www.googleapis.com/customsearch/v1",
      apiKey: "",
      cx: "",
      maxResults: 5,
      enabled: true,
    };
    const validation = validateSearchConfig(newConfig);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Invalid search config";
      get().addToast(`Validation: ${firstError}`, "error");
      return;
    }
    const { searchConfigs } = get();
    const updated = [...searchConfigs, newConfig];
    set({ searchConfigs: updated, activeSearchId: newConfig.id });
    saveSearchConfigs(updated.map(({ apiKey: _apiKey, ...rest }) => rest as SearchApiConfig));
    get().addToast("Search API added — configure its details", "info");
  },

  updateSearchConfig: (id, updates) => {
    const { searchConfigs, searchApiKeys } = get();
    const updatedConfigs = searchConfigs.map((c) => (c.id === id ? { ...c, ...updates } : c));
    set({ searchConfigs: updatedConfigs });

    if (updates.apiKey !== undefined) {
      const newKeys = { ...searchApiKeys, [id]: updates.apiKey! };
      set({ searchApiKeys: newKeys });
      saveSearchApiKeys(newKeys);
    }

    const configsWithoutKeys = updatedConfigs.map(({ apiKey: _apiKey, ...rest }) => rest as SearchApiConfig);
    saveSearchConfigs(configsWithoutKeys);

    if (!updatedConfigs.find((c) => c.id === get().activeSearchId) && updatedConfigs.length > 0) {
      set({ activeSearchId: updatedConfigs[0].id });
    }
  },

  deleteSearchConfig: (id) => {
    const { searchConfigs, activeSearchId, searchApiKeys } = get();
    const updated = searchConfigs.filter((c) => c.id !== id);
    const newKeys = { ...searchApiKeys };
    delete newKeys[id];
    set({
      searchConfigs: updated,
      activeSearchId: activeSearchId === id ? (updated[0]?.id ?? null) : activeSearchId,
      searchApiKeys: newKeys,
    });
    saveSearchConfigs(updated.map(({ apiKey: _apiKey, ...rest }) => rest as SearchApiConfig));
    saveSearchApiKeys(newKeys);
    get().addToast("Search API deleted", "info");
  },

  setActiveSearchId: (id) => set({ activeSearchId: id }),
  toggleSearchEnabled: (enabled) => set({ isSearchEnabled: enabled }),

  performSearch: async (query, config, apiKey) => {
    try {
      const url = new URL(config.baseUrl);
      if (config.provider === "google") {
        url.searchParams.set("key", apiKey);
        url.searchParams.set("cx", config.cx || "");
        url.searchParams.set("q", query);
        url.searchParams.set("num", String(config.maxResults));
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Google Search API error: ${res.status}`);
        const data = await res.json();
        return (data.items || []).map((item: { title?: string; link?: string; snippet?: string }) => ({
          title: item.title || "",
          url: item.link || "",
          snippet: item.snippet || "",
        })) as SearchResult[];
      }
      if (config.provider === "searxng") {
        url.pathname = "/search";
        url.searchParams.set("q", query);
        url.searchParams.set("format", "json");
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`SearXNG error: ${res.status}`);
        const data = await res.json();
        return (data.results || []).slice(0, config.maxResults).map((item: { title?: string; url?: string; content?: string }) => ({
          title: item.title || "",
          url: item.url || "",
          snippet: item.content || "",
        })) as SearchResult[];
      }
      if (config.provider === "firecrawl") {
        const res = await fetch(`${config.baseUrl}/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ query, limit: config.maxResults }),
        });
        if (!res.ok) throw new Error(`Firecrawl error: ${res.status}`);
        const data = await res.json();
        return (data.data || data || []).slice(0, config.maxResults).map((item: { title?: string; url?: string; snippet?: string; content?: string }) => ({
          title: item.title || "",
          url: item.url || "",
          snippet: item.snippet || item.content || "",
        })) as SearchResult[];
      }
      const res = await fetch(config.baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}) },
        body: JSON.stringify({ query, maxResults: config.maxResults }),
      });
      if (!res.ok) throw new Error(`Custom search API error: ${res.status}`);
      const data = await res.json();
      return (data.results || data.items || []).slice(0, config.maxResults).map((item: { title?: string; url?: string; snippet?: string; content?: string }) => ({
        title: item.title || "",
        url: item.url || "",
        snippet: item.snippet || item.content || "",
      })) as SearchResult[];
    } catch (err) {
      logError("Search failed", err);
      get().addToast(parseApiError(err), "error");
      return [];
    }
  },

  fetchUrlContent: async (url) => {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Sythoria/1.0" },
      });
      if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
      const html = await res.text();
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      return {
        url,
        title: titleMatch?.[1]?.trim() || "",
        content: text.slice(0, 10000),
        status: "ok",
      } as UrlContent;
    } catch (err) {
      logError("Fetch URL failed", err);
      return { url, title: "", content: `Error: ${parseApiError(err)}`, status: "error", error: parseApiError(err) } as UrlContent;
    }
  },
}));
