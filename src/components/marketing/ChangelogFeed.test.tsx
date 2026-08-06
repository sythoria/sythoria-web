import { describe, expect, it } from "vitest";
import { formatBytes, formatDate, getAssetPlatform } from "./ChangelogFeed";

describe("changelog formatting", () => {
  it("formats finite asset sizes without overstating invalid values", () => {
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1_572_864)).toBe("1.5 MB");
    expect(formatBytes(0)).toBe("");
    expect(formatBytes(Number.NaN)).toBe("");
  });

  it("formats valid dates and preserves invalid source text", () => {
    expect(formatDate("2026-01-30T00:00:00Z")).toBe("January 30, 2026");
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });

  it("identifies asset platform labels correctly including setup and portable builds", () => {
    expect(getAssetPlatform("Sythoria_0.4.2_x64-setup.exe")).toBe(
      "Windows (Setup)"
    );
    expect(getAssetPlatform("sythoria_windows_x64.exe")).toBe(
      "Windows (Portable)"
    );
    expect(getAssetPlatform("Sythoria_0.4.2_x64-portable.zip")).toBe(
      "Windows (Portable)"
    );
    expect(getAssetPlatform("Sythoria_0.4.2_aarch64.dmg")).toBe("macOS");
    expect(getAssetPlatform("Sythoria_0.4.2_amd64.AppImage")).toBe("Linux");
  });
});
