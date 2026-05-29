import { create } from "zustand";
import type { SearchApiConfig, SearchResult, UrlContent } from "@/lib/types";
import { saveSearchConfigs, saveSearchApiKeys } from "@/utils/storage";
import { logError } from "@/utils/logger";
import { parseApiError } from "@/components/chat/ui/Toast";
import { validateSearchConfig } from "@/utils/validation";
import { useUIStore } from "./useUIStore";

interface SearchState {
  searchConfigs: SearchApiConfig[];
  activeSearchId: string | null;
  isSearchEnabled: boolean;
  searchApiKeys: Record<string, string>;

  addSearchConfig: () => void;
  updateSearchConfig: (id: string, updates: Partial<SearchApiConfig>) => void;
  deleteSearchConfig: (id: string) => void;
  setActiveSearchId: (id: string | null) => void;
  toggleSearchEnabled: (enabled: boolean) => void;
  performSearch: (
    query: string,
    config: SearchApiConfig,
    apiKey: string
  ) => Promise<SearchResult[]>;
  fetchUrlContent: (url: string) => Promise<UrlContent>;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  searchConfigs: [],
  activeSearchId: null,
  isSearchEnabled: false,
  searchApiKeys: {},

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
      const firstError =
        validation.error.issues[0]?.message ?? "Invalid search config";
      useUIStore.getState().addToast(`Validation: ${firstError}`, "error");
      return;
    }
    const { searchConfigs } = get();
    const updated = [...searchConfigs, newConfig];
    set({ searchConfigs: updated, activeSearchId: newConfig.id });
    saveSearchConfigs(
      updated.map(({ apiKey: _apiKey, ...rest }) => rest as SearchApiConfig)
    );
    useUIStore
      .getState()
      .addToast("Search API added — configure its details", "info");
  },

  updateSearchConfig: (id, updates) => {
    const { searchConfigs, searchApiKeys } = get();
    const updatedConfigs = searchConfigs.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    set({ searchConfigs: updatedConfigs });

    if (updates.apiKey !== undefined) {
      const newKeys = { ...searchApiKeys, [id]: updates.apiKey! };
      set({ searchApiKeys: newKeys });
      saveSearchApiKeys(newKeys);
    }

    const configsWithoutKeys = updatedConfigs.map(
      ({ apiKey: _apiKey, ...rest }) => rest as SearchApiConfig
    );
    saveSearchConfigs(configsWithoutKeys);

    if (
      !updatedConfigs.find((c) => c.id === get().activeSearchId) &&
      updatedConfigs.length > 0
    ) {
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
      activeSearchId:
        activeSearchId === id ? (updated[0]?.id ?? null) : activeSearchId,
      searchApiKeys: newKeys,
    });
    saveSearchConfigs(
      updated.map(({ apiKey: _apiKey, ...rest }) => rest as SearchApiConfig)
    );
    saveSearchApiKeys(newKeys);
    useUIStore.getState().addToast("Search API deleted", "info");
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
        return (data.items || []).map(
          (item: { title?: string; link?: string; snippet?: string }) => ({
            title: item.title || "",
            url: item.link || "",
            snippet: item.snippet || "",
          })
        ) as SearchResult[];
      }
      if (config.provider === "searxng") {
        url.pathname = "/search";
        url.searchParams.set("q", query);
        url.searchParams.set("format", "json");
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`SearXNG error: ${res.status}`);
        const data = await res.json();
        return (data.results || [])
          .slice(0, config.maxResults)
          .map((item: { title?: string; url?: string; content?: string }) => ({
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
        return (data.data || data || [])
          .slice(0, config.maxResults)
          .map(
            (item: {
              title?: string;
              url?: string;
              snippet?: string;
              content?: string;
            }) => ({
              title: item.title || "",
              url: item.url || "",
              snippet: item.snippet || item.content || "",
            })
          ) as SearchResult[];
      }
      const res = await fetch(config.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({ query, maxResults: config.maxResults }),
      });
      if (!res.ok) throw new Error(`Custom search API error: ${res.status}`);
      const data = await res.json();
      return (data.results || data.items || [])
        .slice(0, config.maxResults)
        .map(
          (item: {
            title?: string;
            url?: string;
            snippet?: string;
            content?: string;
          }) => ({
            title: item.title || "",
            url: item.url || "",
            snippet: item.snippet || item.content || "",
          })
        ) as SearchResult[];
    } catch (err) {
      logError("Search failed", err);
      useUIStore.getState().addToast(parseApiError(err), "error");
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
      return {
        url,
        title: "",
        content: `Error: ${parseApiError(err)}`,
        status: "error",
        error: parseApiError(err),
      } as UrlContent;
    }
  },
}));
