"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { Search, X, FileText } from "lucide-react";
import { docsNav } from "@/lib/docs-nav";

const allDocs = docsNav.flatMap((g) =>
  g.items.map((item) => ({ ...item, group: g.title })),
);

type SearchVariant = "minimal" | "full";

export default function DocsSearch({
  variant = "minimal",
}: {
  variant?: SearchVariant;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return allDocs;
    const q = query.toLowerCase();
    return allDocs.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  if (!open) {
    if (variant === "full") {
      return (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-muted hover:text-text-secondary border border-border/50 rounded-xl hover:border-border hover:bg-surface/50 transition-all duration-200 min-w-[200px]"
        >
          <Search size={15} />
          <span>Search docs...</span>
          <kbd className="ml-auto inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-surface border border-border/50 rounded">
            ⌘K
          </kbd>
        </button>
      );
    }

    return (
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-text-muted hover:text-text-secondary hover:bg-hover rounded-lg transition-colors"
        aria-label="Search docs"
      >
        <Search size={16} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-2xl mx-4 glass-panel rounded-2xl border border-border/50 shadow-2xl shadow-black/30 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/30">
          <Search size={20} className="text-text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation..."
            className="flex-1 bg-transparent text-base text-text-primary placeholder:text-text-muted outline-none"
          />
          <button
            onClick={handleClose}
            className="p-1 text-text-muted hover:text-text-secondary transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {results.length > 0 ? (
          <ul className="max-h-80 overflow-y-auto py-2 px-2">
            {results.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/docs/${item.slug}`}
                  onClick={handleClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-hover transition-colors"
                >
                  <FileText size={15} className="shrink-0 text-text-muted" />
                  <span className="flex-1">{item.label}</span>
                  <span className="text-xs text-text-muted bg-surface border border-border/50 rounded-md px-2 py-0.5">
                    {item.group}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-12 text-center text-sm text-text-muted">
            No results found
          </div>
        )}
      </div>
    </div>
  );
}
