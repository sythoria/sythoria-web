"use client";

import { useCallback, useEffect, useSyncExternalStore, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui";
import DocsSearch from "./Search";
import { GITHUB_OWNER, GITHUB_REPO } from "@/lib/changelog";

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
  const [scrolled, setScrolled] = useState(false);
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav
        className={`pointer-events-auto relative transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          scrolled
            ? "py-2 px-4 rounded-full bg-surface/80 backdrop-blur-3xl border border-border/50 shadow-2xl shadow-black/5 dark:shadow-black/40 scale-100"
            : "py-3 px-6 rounded-full bg-transparent border border-transparent scale-105"
        }`}
      >
        <div className="flex items-center gap-6">
          <Link
            href="/docs"
            className="flex items-center gap-2 text-text-primary hover:text-accent transition-colors"
          >
            <Image
              src="/logonobg.png"
              alt="Sythoria - Privacy-focused desktop AI client logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-lg font-medium tracking-tight hidden sm:block">
              Sythoria Docs
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="md:hidden">
              <DocsSearch variant="minimal" />
            </div>
            <div className="hidden md:block">
              <DocsSearch variant="full" />
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-hover transition-colors"
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span
                key={iconKey}
                className="theme-icon-rotate flex items-center justify-center"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </span>
            </button>

            <Link
              href="/changelog"
              className="hidden sm:block text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-hover"
            >
              Changelog
            </Link>

            <Link
              href="/"
              className="hidden sm:block text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-hover"
            >
              Home
            </Link>

            <Button
              variant="primary"
              size="sm"
              href={`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full"
            >
              Download
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}
