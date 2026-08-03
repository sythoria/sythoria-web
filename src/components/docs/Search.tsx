"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Search, X } from "lucide-react";
import { docsNav } from "@/lib/docs-nav";
import { useDialogFocus } from "@/hooks/useDialogFocus";

const allDocs = docsNav.flatMap((group) =>
  group.items.map((item) => ({ ...item, group: group.title }))
);

type SearchVariant = "minimal" | "full" | "responsive";

export default function DocsSearch({
  variant = "minimal",
}: {
  variant?: SearchVariant;
}) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const dialogTitleId = useId();
  const listboxId = useId();

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return allDocs;
    return allDocs.filter((item) =>
      [item.label, item.group, item.slug].some((value) =>
        value.toLowerCase().includes(normalized)
      )
    );
  }, [query]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  useDialogFocus({
    open,
    onClose: handleClose,
    dialogRef,
    initialFocusRef: inputRef,
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openSearch = () => setOpen(true);
  const activeResult = results[activeIndex];

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % Math.max(results.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (index) =>
          (index - 1 + Math.max(results.length, 1)) %
          Math.max(results.length, 1)
      );
    } else if (event.key === "Enter" && activeResult) {
      event.preventDefault();
      router.push(`/docs/${activeResult.slug}`);
      handleClose();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openSearch}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={
          variant === "minimal"
            ? "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-hover hover:text-text-secondary"
            : `flex min-h-11 items-center gap-2.5 rounded-xl border border-border/50 px-3 text-sm text-text-muted transition-colors hover:border-border hover:bg-surface/50 hover:text-text-secondary ${
                variant === "responsive" ? "md:min-w-[200px]" : "min-w-[200px]"
              }`
        }
        aria-label="Search docs"
      >
        <Search size={16} aria-hidden="true" />
        {variant !== "minimal" && (
          <>
            <span
              className={variant === "responsive" ? "hidden md:inline" : ""}
            >
              Search docs...
            </span>
            <kbd
              aria-hidden="true"
              className={`ml-auto items-center rounded border border-border/50 bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text-muted ${
                variant === "responsive"
                  ? "hidden md:inline-flex"
                  : "inline-flex"
              }`}
            >
              Ctrl K
            </kbd>
          </>
        )}
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]">
                <motion.button
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-sm"
                  onClick={handleClose}
                  aria-label="Close documentation search"
                  tabIndex={-1}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -10 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  ref={dialogRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={dialogTitleId}
                  tabIndex={-1}
                  className="bg-surface relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border/50 shadow-2xl shadow-black/30"
                >
              <h2 id={dialogTitleId} className="sr-only">
                Search documentation
              </h2>
              <div className="flex items-center gap-3 border-b border-border/30 px-5 py-4">
                <Search
                  size={20}
                  aria-hidden="true"
                  className="shrink-0 text-text-muted"
                />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Search documentation..."
                  role="combobox"
                  aria-label="Search documentation"
                  aria-autocomplete="list"
                  aria-controls={listboxId}
                  aria-expanded="true"
                  aria-activedescendant={
                    activeResult
                      ? `${listboxId}-option-${activeIndex}`
                      : undefined
                  }
                  className="min-w-0 flex-1 bg-transparent text-base text-text-primary outline-none placeholder:text-text-muted"
                />
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-hover hover:text-text-secondary"
                  aria-label="Close search"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              <p className="sr-only" aria-live="polite">
                {results.length} result{results.length === 1 ? "" : "s"}
              </p>
              {results.length > 0 ? (
                <ul
                  id={listboxId}
                  role="listbox"
                  aria-label="Documentation search results"
                  className="max-h-80 space-y-0.5 overflow-y-auto p-3"
                >
                  {results.map((item, index) => (
                    <li
                      key={item.slug}
                      id={`${listboxId}-option-${index}`}
                      role="option"
                      aria-selected={index === activeIndex}
                    >
                      <Link
                        href={`/docs/${item.slug}`}
                        onClick={handleClose}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                          index === activeIndex
                            ? "bg-hover text-text-primary"
                            : "text-text-secondary hover:bg-hover hover:text-text-primary"
                        }`}
                      >
                        <FileText
                          size={15}
                          aria-hidden="true"
                          className="shrink-0 text-text-muted"
                        />
                        <span className="flex-1">{item.label}</span>
                        <span className="text-xs text-text-muted">
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
            </motion.div>
          </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
