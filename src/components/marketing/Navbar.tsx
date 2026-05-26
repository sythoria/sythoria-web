"use client";

import { useCallback, useEffect, useSyncExternalStore, useState } from "react";
import { MessageSquare, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
import DocsSearch from "@/components/docs/Search";

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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [iconKey, setIconKey] = useState(0);
  const dark = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerSnapshot,
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-xl ${
        scrolled
          ? "glass-panel border-b border-border/50 shadow-sm shadow-black/5"
          : "bg-background/70 border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-[4.0rem] flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 text-text-primary hover:text-accent transition-colors"
        >
          <MessageSquare size={24} className="text-accent" />
          <span className="text-lg font-semibold tracking-tight">Sythoria</span>
        </Link>
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
          <Link
            href="/docs"
            className="hidden sm:inline-flex text-[0.95rem] text-text-secondary hover:text-text-primary transition-colors duration-300 px-3.5 py-2 relative after:absolute after:bottom-0.5 after:left-3.5 after:right-3.5 after:h-px after:bg-accent/40 after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100"
          >
            Docs
          </Link>
          <Button variant="primary" size="sm" href="/chat">
            Try it out
          </Button>
        </div>
      </div>
    </nav>
  );
}
