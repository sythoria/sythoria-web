import { create } from "zustand";
import type { Conversation, Message, ModelConfig, ConnectionStatus, ModelStatuses } from "@/lib/types";
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
} from "@/utils/storage";
import { generateId } from "@/utils/generateId";
import { logError, logInfo } from "@/utils/logger";
import { TITLE_MAX_LENGTH, DEFAULT_TEMPERATURE } from "@/lib/config";
import { getSystemPrompt } from "@/config/systemPrompts";
import { parseApiError } from "@/components/chat/ui/Toast";
import type { Toast } from "@/components/chat/ui/Toast";
import { validateModelConfig } from "@/utils/validation";
import { chatStream, checkApiConnection } from "@/lib/api";
import { PROVIDER_PRESETS } from "@/lib/config";

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

export type LoadingKey = "init" | "sendMessage" | "checkConnection" | "saveConfig";

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
  stopStreaming: () => void;
  exportChat: (id: string) => void;
  persistConversations: () => void;
  clearAllChats: () => void;
  checkModelConnections: (modelIds?: string[]) => Promise<void>;
  startHealthCheck: () => void;
  stopHealthCheck: () => void;
  cleanup: () => void;
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
  loading: { init: true, sendMessage: false, checkConnection: false, saveConfig: false },
  toasts: [],
  systemPromptId: null,

  init: () => {
    set((s) => ({ loading: { ...s.loading, init: true } }));
    try {
      const loadedModels = loadModelConfigs();
      const loadedConvs = loadConversations();
      const loadedTheme = loadTheme();
      const loadedKeys = loadApiKeys();

      const models = (loadedModels || []) as ModelConfig[];
      const modelsWithKeys = models.map((m: ModelConfig) => ({
        ...m,
        apiKey: loadedKeys[m.id] ?? m.apiKey,
      }));

      const nonEmptyConvs = loadedConvs.filter((c: Conversation) => c.messages.length > 0);

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
    const { isStreaming, activeId, selectedModel, models, temperature, apiKeys, systemPromptId } = get();
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
    const assistantMsg: Message = {
      id: generateId(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    const finalId = convId;
    const modelConfig = models.find((m) => m.id === selectedModel) ?? models[0];

    if (!modelConfig) {
      logError("No model configuration selected");
      get().addToast("No model configured \u2014 add one in Settings", "error");
      return;
    }

    set((state) => ({
      isStreaming: true,
      loading: { ...state.loading, sendMessage: true },
      conversations: updateConversationMessages(
        state.conversations,
        finalId,
        (msgs) => [...msgs, userMsg, assistantMsg],
        {
          title:
            state.conversations.find((c) => c.id === finalId)?.messages.length === 0 ? truncateTitle(text) : undefined,
        },
      ),
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
        ...(conv?.messages.map((m) => ({
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
      return { isStreaming: false, loading: { ...state.loading, sendMessage: false }, conversations: convs };
    });
  },

  exportChat: (id) => {
    const conv = get().conversations.find((c) => c.id === id);
    if (!conv) return;
    const lines = [
      `# ${conv.title}`,
      ``,
      ...conv.messages.map((m) => {
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
}));
