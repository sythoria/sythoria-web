"use client";

import { useState, useEffect, useRef, memo, useMemo, useCallback, forwardRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, Copy, Check, ArrowDown } from "lucide-react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import type { Message } from "@/lib/types";
import { MessageSkeleton } from "./ui/Skeleton";
import { SYSTEM_PROMPTS } from "@/config/systemPrompts";

interface ChatAreaProps {
  messages: Message[];
  onSuggestionClick: (systemPromptId: string) => void;
}

function MessageContent({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  const markdown = useMemo(() => <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>, [content]);

  return (
    <>
      {markdown}
      {isStreaming && <span className="cursor-blink" aria-label="Generating response" />}
    </>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-hover transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
      aria-label={copied ? "Copied" : "Copy message"}
      title={copied ? "Copied" : "Copy"}
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}

const MessageBubble = memo(function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const [hovered, setHovered] = useState(false);

  if (isUser) {
    return (
      <div
        className="flex justify-end animate-fade-in group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        role="article"
        aria-label={`User message: ${message.content.slice(0, 80)}`}
      >
        <div className="relative max-w-[75%]">
          <div className="glass-panel rounded-2xl rounded-br-md px-4 py-3 text-sm text-text-primary leading-relaxed shadow-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>
          {hovered && (
            <div className="absolute -left-8 top-1/2 -translate-y-1/2">
              <CopyButton text={message.content} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex justify-start gap-3 animate-fade-in group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="article"
      aria-label={`Assistant message${message.isStreaming ? " (generating)" : ""}: ${message.content.slice(0, 80)}`}
    >
      <div
        className="shrink-0 w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mt-0.5"
        aria-hidden="true"
      >
        <Bot size={14} className="text-accent" />
      </div>
      <div className="relative max-w-[80%] text-sm text-text-primary leading-relaxed markdown-body">
        {message.isStreaming && message.content.length === 0 ? (
          <MessageSkeleton />
        ) : (
          <>
            <MessageContent content={message.content} isStreaming={!!message.isStreaming} />
            {!message.isStreaming && hovered && (
              <div className="absolute -top-1 right-0">
                <CopyButton text={message.content} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

const SUGGESTIONS = SYSTEM_PROMPTS.map((p) => ({
  id: p.id,
  icon: p.icon,
  label: p.label,
}));

const VIRTUALIZED_THRESHOLD = 50;

export default function ChatArea({ messages, onSuggestionClick }: ChatAreaProps) {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    if (isAtBottom && virtuosoRef.current && messages.length > 0) {
      virtuosoRef.current.scrollToIndex({
        index: messages.length - 1,
        behavior: "smooth",
        align: "end",
      });
    }
  }, [messages, isAtBottom]);

  if (messages.length === 0) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center select-none animate-slide-up relative"
        role="region"
        aria-label="Empty chat — choose a suggestion or type a message"
      >
        <div className="flex flex-col items-center gap-4 px-4">
          <div
            className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center"
            aria-hidden="true"
          >
            <Bot size={28} className="text-accent" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Sythoria</h1>
            <p className="text-text-muted text-sm mt-1">Your intelligent AI assistant</p>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 w-full max-w-sm" role="group" aria-label="Suggested prompts">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => onSuggestionClick(s.id)}
                className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-border bg-surface/50 hover:bg-hover text-text-secondary hover:text-text-primary text-xs font-medium transition-all duration-150 text-left min-h-[44px]"
                aria-label={s.label}
              >
                <span className="text-accent shrink-0" aria-hidden="true">
                  {s.icon}
                </span>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (messages.length >= VIRTUALIZED_THRESHOLD) {
    return (
      <div className="flex-1 relative" role="log" aria-label="Chat messages" aria-live="polite">
        <Virtuoso
          ref={virtuosoRef}
          data={messages}
          atBottomStateChange={setIsAtBottom}
          atBottomThreshold={100}
          itemContent={(index, msg) => (
            <div className={index > 0 ? "mt-6" : ""}>
              <MessageBubble message={msg} />
            </div>
          )}
          components={{
            List: forwardRef(function VirtuosoList(props, ref) {
              return <div {...props} ref={ref} className="max-w-3xl mx-auto py-8 px-4 md:px-0" />;
            }),
          }}
          followOutput="smooth"
        />
        {!isAtBottom && (
          <button
            onClick={() =>
              virtuosoRef.current?.scrollToIndex({ index: messages.length - 1, behavior: "smooth", align: "end" })
            }
            className="absolute bottom-4 right-4 p-2.5 rounded-full bg-accent text-white shadow-lg hover:bg-accent-hover transition-colors animate-fade-in z-10"
            aria-label="Scroll to bottom"
          >
            <ArrowDown size={18} />
          </button>
        )}
      </div>
    );
  }

  return <NonVirtualizedChatArea messages={messages} />;
}

function NonVirtualizedChatArea({ messages }: { messages: Message[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  useEffect(() => {
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    function onScroll() {
      const target = scrollContainerRef.current;
      if (!target) return;
      const atBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
      setIsAtBottom(atBottom);
      setShowScrollBtn(!atBottom);
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto px-4 md:px-0 relative"
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
    >
      <div className="max-w-3xl mx-auto py-8 space-y-6">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} aria-hidden="true" />
      </div>
      {showScrollBtn && (
        <button
          onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-4 right-4 p-2.5 rounded-full bg-accent text-white shadow-lg hover:bg-accent-hover transition-colors animate-fade-in z-10"
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={18} />
        </button>
      )}
    </div>
  );
}
