import { describe, it, expect, beforeEach } from "vitest";
import {
  loadConversations,
  saveConversations,
  loadTheme,
  saveTheme,
  loadApiKeys,
  saveApiKeys,
  loadModelConfigs,
  saveModelConfigs,
  clearConversations,
} from "./storage";

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

describe("loadConversations / saveConversations", () => {
  it("returns empty array when nothing stored", () => {
    expect(loadConversations()).toEqual([]);
  });

  it("round-trips valid conversations", () => {
    const conversations = [
      {
        id: "abc12345",
        title: "Test chat",
        timestamp: new Date("2024-01-01"),
        messages: [],
        model: "gpt-4o",
      },
    ];
    saveConversations(conversations);
    const loaded = loadConversations();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe("abc12345");
    expect(loaded[0].title).toBe("Test chat");
  });

  it("returns empty array for invalid data", () => {
    localStorage.setItem("sythoria-conversations", "not-json");
    expect(loadConversations()).toEqual([]);
  });
});

describe("loadTheme / saveTheme", () => {
  it("saves and loads dark theme", () => {
    saveTheme("dark");
    expect(loadTheme()).toBe("dark");
  });

  it("saves and loads light theme", () => {
    saveTheme("light");
    expect(loadTheme()).toBe("light");
  });

  it("falls back to system preference when nothing stored", () => {
    const result = loadTheme();
    expect(["light", "dark"]).toContain(result);
  });

  it("ignores invalid theme values", () => {
    localStorage.setItem("sythoria-theme", "blue");
    const result = loadTheme();
    expect(["light", "dark"]).toContain(result);
  });
});

describe("loadApiKeys / saveApiKeys", () => {
  it("returns empty object when nothing stored", () => {
    expect(loadApiKeys()).toEqual({});
  });

  it("round-trips API keys", () => {
    const keys = { "openai-0": "sk-test-key" };
    saveApiKeys(keys);
    expect(loadApiKeys()).toEqual(keys);
  });
});

describe("loadModelConfigs / saveModelConfigs", () => {
  it("returns null when nothing stored", () => {
    expect(loadModelConfigs()).toBeNull();
  });

  it("round-trips model configs", () => {
    const configs = [
      {
        id: "cfg-1",
        name: "GPT-4",
        apiBase: "https://api.openai.com/v1/chat/completions",
        apiKey: "sk-test",
        modelId: "gpt-4o",
      },
    ];
    saveModelConfigs(configs);
    const loaded = loadModelConfigs();
    expect(loaded).not.toBeNull();
    expect(loaded).toHaveLength(1);
  });

  it("returns null for empty array", () => {
    saveModelConfigs([]);
    expect(loadModelConfigs()).toBeNull();
  });
});

describe("clearConversations", () => {
  it("removes conversations from storage", () => {
    saveConversations([
      {
        id: "x",
        title: "Chat",
        timestamp: new Date(),
        messages: [],
        model: "gpt-4o",
      },
    ]);
    expect(loadConversations()).toHaveLength(1);
    clearConversations();
    expect(loadConversations()).toEqual([]);
  });
});
