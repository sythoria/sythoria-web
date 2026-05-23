"use client";

import { forwardRef, useMemo } from "react";
import { ArrowDown } from "lucide-react";

interface ScrollToBottomButtonProps {
  onClick: () => void;
  hasNewMessages?: boolean;
  className?: string;
}

const ScrollToBottomButton = forwardRef<HTMLButtonElement, ScrollToBottomButtonProps>(function ScrollToBottomButton(
  { onClick, hasNewMessages, className = "" },
  ref,
) {
  const label = useMemo(() => {
    return hasNewMessages ? "New messages below. Scroll to bottom." : "Scroll to bottom";
  }, [hasNewMessages]);

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`
        relative flex items-center justify-center
        w-10 h-10 rounded-full
        bg-accent text-white shadow-lg
        hover:bg-accent-hover hover:shadow-xl
        transition-all duration-300 ease-out
        transform hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-chat
        z-30
        ${className}
      `}
      aria-label={label}
      title={label}
    >
      <ArrowDown size={18} className="shrink-0" />
      {hasNewMessages && (
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-chat animate-pulse" />
      )}
    </button>
  );
});

export default ScrollToBottomButton;
