import { describe, it, expect } from "vitest";
import { SEARCH_PROVIDER_PRESETS } from "./searchPresets";

describe("SEARCH_PROVIDER_PRESETS", () => {
  it("has 4 presets", () => {
    expect(SEARCH_PROVIDER_PRESETS).toHaveLength(4);
  });

  it("includes all provider types", () => {
    const providers = SEARCH_PROVIDER_PRESETS.map((p) => p.provider);
    expect(providers).toContain("google");
    expect(providers).toContain("searxng");
    expect(providers).toContain("firecrawl");
    expect(providers).toContain("custom");
  });

  it("every preset has required fields", () => {
    for (const preset of SEARCH_PROVIDER_PRESETS) {
      expect(preset.label).toBeTruthy();
      expect(preset.provider).toBeTruthy();
      expect(preset.defaultMaxResults).toBeGreaterThan(0);
      expect(preset.fields.length).toBeGreaterThan(0);
    }
  });

  it("searxng does not require apiKey", () => {
    const searxng = SEARCH_PROVIDER_PRESETS.find(
      (p) => p.provider === "searxng"
    );
    expect(searxng).toBeDefined();
    expect(searxng!.fields).not.toContain("apiKey");
  });

  it("custom has apiKey as optional field", () => {
    const custom = SEARCH_PROVIDER_PRESETS.find((p) => p.provider === "custom");
    expect(custom).toBeDefined();
    expect(custom!.fields).toContain("apiKey");
  });
});
