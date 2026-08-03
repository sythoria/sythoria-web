import { describe, expect, it } from "vitest";
import { getAllDocSlugs } from "./docs-nav";
import { getAllDocs, getDocBySlug } from "./docs";

describe("documentation loader", () => {
  it("rejects malformed and traversal-like slugs", () => {
    expect(getDocBySlug("../package")).toBeNull();
    expect(getDocBySlug("providers/../../package")).toBeNull();
    expect(getDocBySlug("providers/openai.mdx")).toBeNull();
    expect(getDocBySlug("")).toBeNull();
  });

  it("loads every navigation entry with verification metadata", () => {
    const docs = getAllDocs();
    const loadedSlugs = docs.map((doc) => doc.slug);

    expect(loadedSlugs).toEqual([...loadedSlugs].sort());
    expect(loadedSlugs).toEqual(expect.arrayContaining(getAllDocSlugs()));

    for (const doc of docs) {
      expect(doc.title).toBeTruthy();
      expect(doc.lastVerifiedVersion).toMatch(/^v\d+\.\d+\.\d+$/);
      expect(doc.lastVerifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(doc.source).toBeTruthy();
    }
  });

  it("returns null for a valid-looking page that does not exist", () => {
    expect(getDocBySlug("providers/not-a-provider")).toBeNull();
  });
});
