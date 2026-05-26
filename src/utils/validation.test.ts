import { describe, it, expect } from "vitest";
import {
  validateApiUrl,
  validateApiKey,
  validateSearchApiKey,
} from "./validation";

describe("validateApiUrl", () => {
  it("returns valid for http URLs", () => {
    expect(validateApiUrl("http://localhost:3000")).toEqual({ valid: true });
  });

  it("returns valid for https URLs", () => {
    expect(validateApiUrl("https://api.openai.com/v1")).toEqual({
      valid: true,
    });
  });

  it("returns invalid for non-http protocols", () => {
    const result = validateApiUrl("ftp://files.example.com");
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("returns invalid for malformed URLs", () => {
    const result = validateApiUrl("not-a-url");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid URL format");
  });

  it("returns invalid for empty string", () => {
    const result = validateApiUrl("");
    expect(result.valid).toBe(false);
  });
});

describe("validateApiKey", () => {
  it("returns valid for local providers without a key", () => {
    expect(validateApiKey("", "Ollama (Local)")).toEqual({ valid: true });
    expect(validateApiKey("", "Local")).toEqual({ valid: true });
  });

  it("returns invalid for cloud providers without a key", () => {
    const result = validateApiKey("", "OpenAI");
    expect(result.valid).toBe(false);
    expect(result.warning).toBeDefined();
  });

  it("returns invalid for empty/whitespace key with cloud provider", () => {
    const result = validateApiKey("   ", "Anthropic");
    expect(result.valid).toBe(false);
  });

  it("returns valid for non-empty key", () => {
    expect(validateApiKey("sk-abc123", "OpenAI")).toEqual({ valid: true });
  });

  it("returns valid when no provider specified and key is present", () => {
    expect(validateApiKey("sk-key")).toEqual({ valid: true });
  });
});

describe("validateSearchApiKey", () => {
  it("returns valid for searxng without a key", () => {
    expect(validateSearchApiKey(undefined, "searxng")).toEqual({ valid: true });
  });

  it("returns valid for custom without a key", () => {
    expect(validateSearchApiKey(undefined, "custom")).toEqual({ valid: true });
  });

  it("returns invalid for google without a key", () => {
    const result = validateSearchApiKey(undefined, "google");
    expect(result.valid).toBe(false);
  });

  it("returns valid for google with a key", () => {
    expect(validateSearchApiKey("my-key", "google")).toEqual({ valid: true });
  });

  it("returns invalid for empty key with firecrawl", () => {
    const result = validateSearchApiKey("", "firecrawl");
    expect(result.valid).toBe(false);
  });
});
