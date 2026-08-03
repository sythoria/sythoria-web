"use client";

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let mediaQuery: MediaQueryList | null = null;
let transitionTimer: number | null = null;

function readSavedTheme(): "dark" | "light" | null {
  try {
    const value = localStorage.getItem("sythoria-theme");
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

function getThemeSnapshot(): boolean {
  if (typeof window === "undefined") return true;
  const saved = readSavedTheme();
  if (saved) return saved === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function emitThemeChange() {
  listeners.forEach((listener) => listener());
}

function handleSystemThemeChange() {
  if (readSavedTheme() === null) {
    document.documentElement.classList.toggle("dark", getThemeSnapshot());
    emitThemeChange();
  }
}

function handleStorage(event: StorageEvent) {
  if (event.key !== "sythoria-theme") return;
  document.documentElement.classList.toggle("dark", getThemeSnapshot());
  emitThemeChange();
}

function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1 && typeof window !== "undefined") {
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleSystemThemeChange);
    window.addEventListener("storage", handleStorage);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      mediaQuery?.removeEventListener("change", handleSystemThemeChange);
      window.removeEventListener("storage", handleStorage);
      mediaQuery = null;
    }
  };
}

function setTheme(dark: boolean) {
  if (transitionTimer !== null) window.clearTimeout(transitionTimer);
  document.documentElement.classList.add("theme-transition");
  try {
    localStorage.setItem("sythoria-theme", dark ? "dark" : "light");
  } catch {
    // The class still updates when storage is blocked.
  }
  document.documentElement.classList.toggle("dark", dark);
  emitThemeChange();
  transitionTimer = window.setTimeout(() => {
    document.documentElement.classList.remove("theme-transition");
    transitionTimer = null;
  }, 500);
}

export function useTheme() {
  const dark = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    () => true
  );
  const toggleTheme = useCallback(() => setTheme(!dark), [dark]);
  return { dark, toggleTheme };
}
