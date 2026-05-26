import { describe, it, expect } from "vitest";
import { getSystemPrompt, SYSTEM_PROMPTS } from "./systemPrompts";

describe("SYSTEM_PROMPTS", () => {
  it("has 4 prompt templates", () => {
    expect(SYSTEM_PROMPTS).toHaveLength(4);
  });

  it("every template has required fields", () => {
    for (const prompt of SYSTEM_PROMPTS) {
      expect(prompt.id).toBeTruthy();
      expect(prompt.label).toBeTruthy();
      expect(prompt.icon).toBeDefined();
      expect(prompt.prompt).toBeTruthy();
    }
  });

  it("has unique ids", () => {
    const ids = SYSTEM_PROMPTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getSystemPrompt", () => {
  it("returns prompt for known id", () => {
    const prompt = getSystemPrompt("code-help");
    expect(prompt).toBeDefined();
    expect(prompt!.length).toBeGreaterThan(0);
  });

  it("returns undefined for unknown id", () => {
    expect(getSystemPrompt("non-existent")).toBeUndefined();
  });
});
