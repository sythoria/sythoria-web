"use client";

import { useCallback, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Home, Sparkles, Download } from "lucide-react";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { GITHUB_LATEST_RELEASE_URL } from "@/lib/site-config";
import DocsSidebar from "./Sidebar";

export default function DocsMobileDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogId = useId();
  const titleId = useId();
  const close = useCallback(() => setIsOpen(false), []);

  useDialogFocus({
    open: isOpen,
    onClose: close,
    dialogRef,
    initialFocusRef: closeRef,
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex min-h-12 items-center gap-2 rounded-full bg-accent p-4 text-accent-contrast shadow-2xl transition-transform hover:scale-105 active:scale-95 lg:hidden"
        aria-label="Open documentation menu"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={dialogId}
      >
        <Menu size={20} aria-hidden="true" />
        <span className="text-sm font-semibold tracking-wide">Menu</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            onClick={close}
            tabIndex={-1}
            aria-label="Close documentation menu"
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
          />
          <div
            ref={dialogRef}
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-border/50 bg-surface/95 p-6 shadow-2xl backdrop-blur-3xl"
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src="/logonobg.png"
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7"
                />
                <h2
                  id={titleId}
                  className="text-base font-semibold text-text-primary"
                >
                  Docs navigation
                </h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-hover hover:text-text-primary"
                aria-label="Close documentation menu"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="mb-4 pb-4 border-b border-border/40 space-y-1">
                <Link
                  href="/"
                  onClick={close}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-text-primary hover:bg-hover transition-colors"
                >
                  <Home size={16} className="text-accent" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/changelog"
                  prefetch={false}
                  onClick={close}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-hover transition-colors"
                >
                  <Sparkles size={16} className="text-text-muted" />
                  <span>Changelog</span>
                </Link>
                <a
                  href={GITHUB_LATEST_RELEASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-hover transition-colors"
                >
                  <Download size={16} className="text-text-muted" />
                  <span>Download App</span>
                </a>
              </div>

              <DocsSidebar onItemClick={close} minimal />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
