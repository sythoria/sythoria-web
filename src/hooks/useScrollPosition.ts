"use client";

import { useState, useCallback, useRef } from "react";
import type { VirtuosoHandle } from "react-virtuoso";

export function useScrollButton() {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

  const scrollToBottom = useCallback(() => {
    if (virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({
        index: Number.MAX_SAFE_INTEGER,
        behavior: "smooth",
        align: "end",
      });
      return;
    }

    const el = document.querySelector(
      "[data-chat-scroll]"
    ) as HTMLElement | null;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, []);

  return { isAtBottom, setIsAtBottom, scrollToBottom, virtuosoRef };
}
