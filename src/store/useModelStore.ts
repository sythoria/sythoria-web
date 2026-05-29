import { create } from "zustand";
import type { ModelConfig, ConnectionStatus, ModelStatuses } from "@/lib/types";
import { saveModelConfigs, saveApiKeys } from "@/utils/storage";
import { logError } from "@/utils/logger";
import { DEFAULT_TEMPERATURE } from "@/lib/config";
import { checkApiConnection } from "@/lib/api";
import { useUIStore } from "./useUIStore";

let healthCheckInterval: ReturnType<typeof setInterval> | null = null;
const HEALTH_CHECK_INTERVAL_MS = 5 * 60 * 1000;
const MIN_CHECK_INTERVAL_MS = 30 * 1000;
let lastCheckTime = 0;

interface ModelState {
  models: ModelConfig[];
  selectedModel: string;
  temperature: number;
  apiKeys: Record<string, string>;
  modelStatuses: ModelStatuses;

  setSelectedModel: (model: string) => void;
  setTemperature: (t: number) => void;
  updateModel: (id: string, updates: Partial<ModelConfig>) => void;
  deleteModel: (id: string) => void;
  addModel: () => void;
  checkModelConnections: (
    modelIds?: string[],
    force?: boolean
  ) => Promise<void>;
  startHealthCheck: () => void;
  stopHealthCheck: () => void;
  cleanup: () => void;
}

export const useModelStore = create<ModelState>((set, get) => ({
  models: [],
  selectedModel: "",
  temperature: DEFAULT_TEMPERATURE,
  apiKeys: {},
  modelStatuses: {},

  setSelectedModel: (model) => {
    const { modelStatuses } = get();
    set({ selectedModel: model });
    if (!modelStatuses[model]) {
      get().checkModelConnections([model]);
    }
  },

  setTemperature: (t) => set({ temperature: t }),

  updateModel: (id, updates) => {
    const { models, apiKeys, modelStatuses } = get();
    const updatedModels = models.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    set({ models: updatedModels });
    saveModelConfigs(
      updatedModels.map(({ apiKey: _apiKey, ...rest }) => rest as ModelConfig)
    );

    if (updates.apiKey !== undefined) {
      const newKeys = { ...apiKeys, [id]: updates.apiKey };
      set({ apiKeys: newKeys });
      saveApiKeys(newKeys);
    }

    if (updates.apiBase || updates.apiKey !== undefined) {
      get().checkModelConnections([id]);
    }

    const { selectedModel } = get();
    if (
      !updatedModels.find((m) => m.id === selectedModel) &&
      updatedModels.length > 0
    ) {
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
    saveModelConfigs(
      updated.map(({ apiKey: _apiKey, ...rest }) => rest as ModelConfig)
    );
    saveApiKeys(newKeys);
    if (selectedModel === id && updated.length > 0) {
      set({ selectedModel: updated[0].id });
    }
    useUIStore.getState().addToast("Model deleted", "info");
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
    saveModelConfigs(
      updated.map(({ apiKey: _apiKey, ...rest }) => rest as ModelConfig)
    );
    get().checkModelConnections([newModel.id]);
    useUIStore
      .getState()
      .addToast("Model added — configure its details", "info");
  },

  checkModelConnections: async (modelIds?: string[], force?: boolean) => {
    const { models, apiKeys, modelStatuses } = get();
    if (!force) {
      if (useUIStore.getState().loading.checkConnection) return;
      const now = Date.now();
      if (now - lastCheckTime < MIN_CHECK_INTERVAL_MS) return;
    }
    lastCheckTime = Date.now();

    const toCheck = modelIds
      ? models.filter((m) => modelIds.includes(m.id))
      : models;

    if (toCheck.length === 0) return;

    useUIStore.getState().setLoading("checkConnection", true);

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
          return {
            id: model.id,
            status: (ok ? "connected" : "error") as ConnectionStatus,
          };
        } catch {
          return { id: model.id, status: "error" as ConnectionStatus };
        }
      })
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

    set({ modelStatuses: newStatuses });
    useUIStore.getState().setLoading("checkConnection", false);
  },

  startHealthCheck: () => {
    if (healthCheckInterval) return;
    healthCheckInterval = setInterval(() => {
      get().checkModelConnections();
    }, HEALTH_CHECK_INTERVAL_MS);
  },

  stopHealthCheck: () => {
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
      healthCheckInterval = null;
    }
  },

  cleanup: () => {
    get().stopHealthCheck();
  },
}));
