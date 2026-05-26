import { describe, it, expect } from "vitest";
import { generateId } from "./generateId";

describe("generateId", () => {
  it("returns a string of ID_LENGTH characters", () => {
    const id = generateId();
    expect(id).toHaveLength(8);
  });

  it("returns unique values on successive calls", () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateId()));
    expect(ids.size).toBe(50);
  });

  it("returns only hex characters", () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f-]+$/);
  });
});
