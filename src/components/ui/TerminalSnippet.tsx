"use client";

import { useState, useEffect, useRef } from "react";
import { Check, Copy } from "lucide-react";

export default function TerminalSnippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    },
    []
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="w-full flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-black/10 dark:bg-black/40 px-3 py-2 font-mono text-xs">
      <span className="text-text-primary select-all break-all overflow-x-auto whitespace-pre font-medium">
        {code}
      </span>
      <button
        onClick={handleCopy}
        className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-hover dark:hover:bg-white/5 transition-colors shrink-0 cursor-pointer"
        title="Copy to clipboard"
        aria-label={copied ? "Copied command" : "Copy command"}
        type="button"
      >
        {copied ? (
          <Check size={14} className="text-emerald-400" />
        ) : (
          <Copy size={14} />
        )}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Command copied to clipboard" : ""}
      </span>
    </div>
  );
}
