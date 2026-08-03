"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let frame = 0;

function handleScroll() {
  if (frame) return;
  frame = window.requestAnimationFrame(() => {
    frame = 0;
    listeners.forEach((listener) => listener());
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    window.addEventListener("scroll", handleScroll, { passive: true });
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("scroll", handleScroll);
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}

export function useScrolled() {
  return useSyncExternalStore(
    subscribe,
    () => window.scrollY > 20,
    () => false
  );
}
