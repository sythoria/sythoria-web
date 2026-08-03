"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Moon, Sun } from "lucide-react";
import DocsSearch from "./Search";
import { GITHUB_LATEST_RELEASE_URL } from "@/lib/site-config";
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
              className="hidden sm:block text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-hover"
            >
              Home
            </Link>

            <a
              href={GITHUB_LATEST_RELEASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:block relative group overflow-hidden rounded-full p-[1px]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-chrome-glow via-white to-chrome-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
              <div className="relative bg-text-primary text-surface px-4 py-1.5 rounded-full text-sm font-medium transition-transform group-hover:scale-[0.98]">
                Download
              </div>
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
}
