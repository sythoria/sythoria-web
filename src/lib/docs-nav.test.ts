import { describe, it, expect } from "vitest";
import {
  docsNav,
  getAllDocSlugs,
  getDocMeta,
  getAdjacentDocs,
} from "./docs-nav";

describe("docsNav", () => {
  it("has at least one group", () => {
    expect(docsNav.length).toBeGreaterThan(0);
  });

  it("every group has a title and items", () => {
    for (const group of docsNav) {
      expect(group.title).toBeTruthy();
      expect(group.items.length).toBeGreaterThan(0);
    }
  });

  it("every item has label and slug", () => {
    for (const group of docsNav) {
      for (const item of group.items) {
        expect(item.label).toBeTruthy();
        expect(item.slug).toBeTruthy();
      }
    }
  });
});

describe("getAllDocSlugs", () => {
  it("returns flat list of all slugs", () => {
    const slugs = getAllDocSlugs();
    expect(slugs.length).toBeGreaterThan(0);
    expect(slugs).toContain("getting-started");
  });

  it("has no duplicate slugs", () => {
    const slugs = getAllDocSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("getDocMeta", () => {
  it("returns meta for an existing slug", () => {
    const meta = getDocMeta("getting-started");
    expect(meta).not.toBeNull();
    expect(meta!.label).toBe("Quickstart");
    expect(meta!.group).toBe("Getting Started");
  });

  it("returns null for unknown slug", () => {
    expect(getDocMeta("non-existent")).toBeNull();
  });
});

describe("getAdjacentDocs", () => {
  it("returns prev and next for a middle item", () => {
    const adj = getAdjacentDocs("features/streaming");
    expect(adj.prev).not.toBeNull();
    expect(adj.next).not.toBeNull();
  });

  it("first item has no prev", () => {
    const firstSlug = getAllDocSlugs()[0];
    const adj = getAdjacentDocs(firstSlug);
    expect(adj.prev).toBeNull();
    expect(adj.next).not.toBeNull();
  });

  it("last item has no next", () => {
    const slugs = getAllDocSlugs();
    const lastSlug = slugs[slugs.length - 1];
    const adj = getAdjacentDocs(lastSlug);
    expect(adj.prev).not.toBeNull();
    expect(adj.next).toBeNull();
  });
});
