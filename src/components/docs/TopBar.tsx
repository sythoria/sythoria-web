"use client";

import { useCallback, useSyncExternalStore, useState } from "react";
import Link from "next/link";
import { BookOpen, Moon, Sun } from "lucide-react";
import DocsSearch from "./Search";

let themeListeners: Array<() => void> = [];
function emitThemeChange() {
  for (const l of themeListeners) l();
}
function subscribeTheme(cb: () => void) {
  themeListeners.push(cb);
  return () => {
    themeListeners = themeListeners.filter((l) => l !== cb);
  };
}
function getThemeSnapshot(): boolean {
  if (typeof window === "undefined") return true;
  const saved = localStorage.getItem("sythoria-theme");
  if (saved) return saved === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function getServerSnapshot(): true {
  return true;
}

export default function DocsTopBar() {
  const [iconKey, setIconKey] = useState(0);
  const dark = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerSnapshot
  );

  const toggleTheme = useCallback(() => {
    const next = !dark;
    document.documentElement.classList.add("theme-transition");
    localStorage.setItem("sythoria-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
    setIconKey((k) => k + 1);
    emitThemeChange();
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 500);
  }, [dark]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border/50 shadow-sm shadow-black/5">
      <div className="max-w-6xl mx-auto px-6 h-[4.0rem] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/docs"
            className="flex items-center gap-2 text-text-primary hover:text-accent transition-colors"
          >
            <BookOpen size={18} className="text-accent" />
            <span className="text-base font-semibold tracking-tight">
              Sythoria Docs
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            Home
          </Link>
          <Link
            href="/chat"
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            Chat
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <DocsSearch variant="full" />
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-hover transition-colors"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span key={iconKey} className="theme-icon-rotate">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
