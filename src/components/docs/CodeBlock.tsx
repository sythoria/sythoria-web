"use client";

import {
  type ComponentPropsWithoutRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { Check, Copy, X } from "lucide-react";

type CopyState = "idle" | "copied" | "failed";

export function CodeBlock({
  children,
  ...props
}: ComponentPropsWithoutRef<"pre">) {
  const preRef = useRef<HTMLPreElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    []
  );

  async function copyCode() {
    const value = preRef.current?.textContent ?? "";
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Unavailable");
      await navigator.clipboard.writeText(value);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState("idle"), 2000);
  }

  const label =
    copyState === "copied"
      ? "Code copied"
      : copyState === "failed"
        ? "Copy failed"
        : "Copy code";

  return (
    <div className="code-block-shell">
      <pre {...props} ref={preRef} tabIndex={0} aria-label="Code example">
        {children}
      </pre>
      <button
        type="button"
        onClick={copyCode}
        className="code-copy-button"
        aria-label={label}
      >
        {copyState === "copied" ? (
          <Check aria-hidden size={15} />
        ) : copyState === "failed" ? (
          <X aria-hidden size={15} />
        ) : (
          <Copy aria-hidden size={15} />
        )}
        <span>{copyState === "idle" ? "Copy" : label}</span>
      </button>
      <span className="sr-only" aria-live="polite">
        {copyState === "idle" ? "" : label}
      </span>
    </div>
  );
}
