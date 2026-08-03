import { describe, expect, it } from "vitest";
import { formatBytes, formatDate } from "./ChangelogFeed";

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
});
