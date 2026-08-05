"use client";

import { useCallback, useId, useRef, useState } from "react";
import { Moon, Sun, Menu, X, Download } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import DocsSearch from "@/components/docs/Search";
import {
  GITHUB_LATEST_RELEASE_URL,
  GITHUB_REPOSITORY_URL,
} from "@/lib/site-config";
import { useTheme } from "@/hooks/useTheme";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { useScrolled } from "@/hooks/useScrolled";

export default function Navbar() {
  const pathname = usePathname();
  const scrolled = useScrolled();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [iconKey, setIconKey] = useState(0);
  const mobileDialogRef = useRef<HTMLDivElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);
  const mobileDialogId = useId();

  const { dark, toggleTheme: baseToggleTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    baseToggleTheme();
    setIconKey((k) => k + 1);
  }, [baseToggleTheme]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useDialogFocus({
    open: mobileOpen,
    onClose: closeMobile,
    dialogRef: mobileDialogRef,
    initialFocusRef: firstMobileLinkRef,
  });

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
                prefetch={false}
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-hover"
              >
                Changelog
              </Link>
              <Link
                href={GITHUB_REPOSITORY_URL}
                target="_blank"
                rel="noopener noreferrer"
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
                href={GITHUB_LATEST_RELEASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-1.5 bg-text-primary text-surface rounded-full text-xs font-semibold shadow-sm transition-all duration-300 ease-out hover:scale-[1.04] hover:shadow-md hover:shadow-accent/20 active:scale-[0.97] group select-none relative overflow-hidden"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="md:hidden p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                aria-controls={mobileDialogId}
                aria-haspopup="dialog"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div
          ref={mobileDialogRef}
          id={mobileDialogId}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          tabIndex={-1}
          className="mobile-nav-overlay open"
        >
          <nav
            aria-label="Mobile site navigation"
            className="flex h-full flex-col items-center justify-center gap-2 px-8"
          >
            <Link
              ref={firstMobileLinkRef}
              href="/"
              onClick={closeMobile}
              className="mobile-nav-link"
            >
              Home
            </Link>
            <Link
              href="/docs"
              onClick={closeMobile}
              className="mobile-nav-link"
            >
              Docs
            </Link>
            <Link
              href="/changelog"
              prefetch={false}
              onClick={closeMobile}
              className="mobile-nav-link"
            >
              Changelog
            </Link>
            <a
              href={GITHUB_REPOSITORY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobile}
              className="mobile-nav-link"
            >
              GitHub
            </a>
            <a
              href={GITHUB_LATEST_RELEASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobile}
              className="mobile-nav-link"
            >
              Download
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
