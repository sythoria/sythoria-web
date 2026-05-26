import { describe, it, expect } from "vitest";
import {
  PROVIDER_PRESETS,
  MAX_INPUT_LENGTH,
  MAX_TEXTAREA_HEIGHT,
  DEBOUNCE_MS,
  TITLE_MAX_LENGTH,
  ID_LENGTH,
  DEFAULT_TEMPERATURE,
  MAX_TEMPERATURE,
  MIN_TEMPERATURE,
  TEMPERATURE_STEP,
  SIDEBAR_WIDTH,
  MAX_TOOL_STEPS,
} from "./config";

describe("PROVIDER_PRESETS", () => {
  it("includes all major providers", () => {
    const labels = PROVIDER_PRESETS.map((p) => p.label);
    expect(labels).toContain("OpenAI");
    expect(labels).toContain("Anthropic");
    expect(labels).toContain("Google Gemini");
    expect(labels).toContain("Ollama (Local)");
    expect(labels).toContain("NVIDIA NIM");
    expect(labels).toContain("OpenRouter");
    expect(labels).toContain("Custom");
  });

  it("every preset has a non-empty label and apiBase pattern", () => {
    for (const preset of PROVIDER_PRESETS) {
      expect(preset.label).toBeTruthy();
      expect(preset.defaultModel).toBeDefined();
    }
  });

  it("Custom preset has empty defaults", () => {
    const custom = PROVIDER_PRESETS.find((p) => p.label === "Custom");
    expect(custom).toBeDefined();
    expect(custom!.apiBase).toBe("");
    expect(custom!.defaultModel).toBe("");
  });
});

describe("Numeric constants", () => {
  it("has sensible numeric values", () => {
    expect(MAX_INPUT_LENGTH).toBe(10000);
    expect(MAX_TEXTAREA_HEIGHT).toBe(200);
    expect(DEBOUNCE_MS).toBe(150);
    expect(TITLE_MAX_LENGTH).toBe(40);
    expect(ID_LENGTH).toBe(8);
    expect(DEFAULT_TEMPERATURE).toBe(0.7);
    expect(MAX_TEMPERATURE).toBe(2.0);
    expect(MIN_TEMPERATURE).toBe(0.0);
    expect(TEMPERATURE_STEP).toBe(0.1);
    expect(SIDEBAR_WIDTH).toBe(260);
    expect(MAX_TOOL_STEPS).toBe(5);
  });

  it("temperature range is valid", () => {
    expect(MIN_TEMPERATURE).toBeLessThan(DEFAULT_TEMPERATURE);
    expect(DEFAULT_TEMPERATURE).toBeLessThan(MAX_TEMPERATURE);
  });
});
