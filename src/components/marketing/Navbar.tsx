"use client";

import { useCallback, useEffect, useSyncExternalStore, useState } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import DocsSearch from "@/components/docs/Search";
import { GITHUB_OWNER, GITHUB_REPO } from "@/lib/changelog";

/* ── Theme store (unchanged) ── */
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
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav
          className={`pointer-events-auto relative transition-[padding,background-color,border-color,box-shadow] duration-300 ease-out ${
            scrolled
              ? "py-2 px-4 rounded-full bg-landing-card backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-2xl shadow-black/10 dark:shadow-black/40"
              : "py-3 px-6 rounded-full bg-transparent border border-transparent"
          }`}
        >
          <div className="flex items-center gap-6">
            <Link
              href="/"
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="flex items-center gap-2 text-text-primary hover:text-accent transition-colors"
            >
              <Image
                src="/logonobg.png"
                alt="Sythoria - Privacy-focused desktop AI client logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-lg font-medium tracking-tight">
                Sythoria
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/docs"
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-hover"
              >
                Docs
              </Link>
              <Link
                href="/changelog"
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-hover"
              >
                Changelog
              </Link>
              <Link
                href={`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`}
                target="_blank"
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-hover"
              >
                GitHub
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <DocsSearch variant="full" />
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-hover transition-colors"
                aria-label={
                  dark ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                <span
                  key={iconKey}
                  className="theme-icon-rotate flex items-center justify-center"
                >
                  {dark ? <Sun size={18} /> : <Moon size={18} />}
                </span>
              </button>

              {/* Desktop download app */}
              <a
                href={`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:block relative group overflow-hidden rounded-full p-[1px]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-chrome-glow via-white to-chrome-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
                <div className="relative bg-text-primary text-surface px-4 py-1.5 rounded-full text-sm font-medium transition-transform group-hover:scale-[0.98]">
                  Download
                </div>
              </a>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="md:hidden p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile nav overlay */}
      <div className={`mobile-nav-overlay ${mobileOpen ? "open" : ""}`}>
        <div className="flex flex-col items-center justify-center h-full gap-2 px-8">
          <Link href="/" onClick={closeMobile} className="mobile-nav-link">
            Home
          </Link>
          <Link href="/docs" onClick={closeMobile} className="mobile-nav-link">
            Docs
          </Link>
          <Link
            href="/changelog"
            onClick={closeMobile}
            className="mobile-nav-link"
          >
            Changelog
          </Link>
          <a
            href={`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMobile}
            className="mobile-nav-link"
          >
            GitHub
          </a>
          <a
            href={`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMobile}
            className="mobile-nav-link"
          >
            Download
          </a>
        </div>
      </div>
    </>
  );
}
