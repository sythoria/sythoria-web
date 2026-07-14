"use client";

import { useCallback, useSyncExternalStore } from "react";

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

export function useTheme() {
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
    emitThemeChange();
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 500);
  }, [dark]);

  return { dark, toggleTheme };
}
