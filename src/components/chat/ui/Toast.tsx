"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  400: "Bad request \u2014 the API received invalid parameters.",
  401: "Invalid API key \u2014 check your credentials in Settings.",
  403: "Access denied \u2014 your API key does not have permission for this model.",
  404: "Model not found \u2014 the model ID may be incorrect or deprecated.",
  429: "Rate limited \u2014 too many requests. Wait a moment and try again.",
  500: "Server error \u2014 the provider is having issues. Try again later.",
  502: "Bad gateway \u2014 the provider server is temporarily unreachable.",
  503: "Service unavailable \u2014 the provider is temporarily down.",
};

function parseApiError(err: unknown): string {
  if (err instanceof Error) return userFriendlyMessage(err.message);
  if (typeof err === "string") return userFriendlyMessage(err);
  return "An unexpected error occurred. Please try again.";
}

function userFriendlyMessage(raw: string): string {
  const statusMatch = raw.match(/API error (\d{3})/);
  if (statusMatch) {
    const code = statusMatch[1];
    return ERROR_MESSAGES[code] ?? `API error ${code}: ${raw.replace(/API error \d{3}:\s*/, "")}`;
  }

  if (raw.includes("Failed to fetch") || raw.includes("NetworkError") || raw.includes("error sending request")) {
    return "Network error \u2014 check your internet connection and API base URL.";
  }
  if (raw.includes("timeout") || raw.includes("Timed out")) {
    return "Request timed out \u2014 the provider took too long to respond.";
  }
  if (raw.includes("Invalid URL") || raw.includes("relative URL without a base")) {
    return "Invalid API URL \u2014 check the base URL in Settings.";
  }

  return raw.length > 200 ? raw.slice(0, 200) + "\u2026" : raw;
}

export { parseApiError };

export interface Toast {
  id: string;
  message: string;
  variant: "error" | "success" | "info";
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const VARIANT_STYLES: Record<Toast["variant"], string> = {
  error: "border-red-500/30 bg-red-500/10 text-red-400",
  success: "border-green-500/30 bg-green-500/10 text-green-400",
  info: "border-accent/30 bg-accent-soft text-text-secondary",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(toast.id), 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md animate-slide-up ${VARIANT_STYLES[toast.variant]}`}
      role="alert"
      aria-live="assertive"
    >
      <p className="flex-1 text-sm leading-relaxed">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
