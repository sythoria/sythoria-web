"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Moon, Sun, Download, Home } from "lucide-react";
import DocsSearch from "./Search";
import { useTheme } from "@/hooks/useTheme";
import { useScrolled } from "@/hooks/useScrolled";

export default function DocsTopBar() {
  const scrolled = useScrolled();
  const [iconKey, setIconKey] = useState(0);
  const { dark, toggleTheme: baseToggleTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    baseToggleTheme();
    setIconKey((k) => k + 1);
  }, [baseToggleTheme]);

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav
        className={`pointer-events-auto relative transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          scrolled
            ? "py-2 px-4 rounded-full bg-surface/80 backdrop-blur-3xl border border-border/50 shadow-2xl shadow-black/5 dark:shadow-black/40 scale-100"
            : "py-3 px-6 rounded-full bg-transparent border border-transparent scale-100 sm:scale-105"
        }`}
      >
        <div className="flex items-center gap-6">
          <Link
            href="/docs"
            aria-label="Sythoria documentation home"
            className="flex items-center gap-2 text-text-primary hover:text-accent transition-colors"
          >
            <Image
              src="/logonobg.png"
              alt=""
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-lg font-medium tracking-tight hidden sm:block">
              Sythoria Docs
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <DocsSearch variant="responsive" />

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
              prefetch={false}
              className="hidden sm:block text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-hover"
            >
              Changelog
            </Link>

            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-2.5 sm:px-3 py-1.5 rounded-full hover:bg-hover"
            >
              <Home size={14} className="sm:hidden" />
              <span>Home</span>
            </Link>

            <Link
              href="/downloads"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-1.5 bg-text-primary text-surface rounded-full text-xs font-semibold shadow-sm transition-all duration-300 ease-out hover:scale-[1.04] hover:shadow-md hover:shadow-accent/20 active:scale-[0.97] group select-none relative overflow-hidden"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
