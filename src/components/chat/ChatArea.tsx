"use client";

import { useState, useEffect, useRef, memo, useMemo, useCallback, forwardRef, useDeferredValue } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Bot, Copy, Check, Search, Globe, Wrench, ChevronDown, Loader2, ExternalLink, Sparkles } from "lucide-react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import type { Message } from "@/lib/types";
import { MessageSkeleton } from "./ui/Skeleton";

interface ChatAreaProps {
  messages: Message[];
  onSuggestionClick: () => void;
  isAtBottom: boolean;
  setIsAtBottom: (v: boolean) => void;
  virtuosoRef: React.RefObject<VirtuosoHandle | null>;
}

function MessageContent({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  const deferredContent = useDeferredValue(content);
  const renderContent = isStreaming ? deferredContent : content;

  const markdown = useMemo(
    () => (
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
        {renderContent}
      </ReactMarkdown>
    ),
    [renderContent],
  );

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

function SourcesList({ sources }: { sources: { title: string; url: string }[] }) {
  const [expanded, setExpanded] = useState(false);
  const displaySources = expanded ? sources : sources.slice(0, 3);

  return (
    <div className="mt-2 pt-2 border-t border-border/30">
      <p className="text-[10px] text-text-muted mb-1.5 font-medium">Sources</p>
      <div className="flex flex-wrap gap-1.5">
        {displaySources.map((s, i) => (
          <a
            key={i}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-accent hover:underline max-w-[180px] truncate"
            title={s.title}
          >
            <ExternalLink size={9} className="shrink-0" />
            <span className="truncate">{s.title || s.url}</span>
          </a>
        ))}
      </div>
      {sources.length > 3 && !expanded && (
        <button onClick={() => setExpanded(true)} className="text-[10px] text-text-muted hover:text-text-secondary mt-1">
          +{sources.length - 3} more sources
        </button>
      )}
    </div>
  );
}

function ToolCallDisplay({ message }: { message: Message }) {
  const { name, arguments: args } = message.toolCall!;
  const isSearch = name === "search_query";
  const isFetch = name === "fetch_url";
  const isCompleted = !!message.toolResult;

  return (
    <div className="flex items-start gap-2 animate-fade-in">
      <div
        className={`shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center mt-0.5 ${
          isCompleted ? "bg-green-500/10 border-green-500/20" : "bg-yellow-500/10 border-yellow-500/20"
        }`}
        aria-hidden="true"
      >
        {isSearch ? (
          <Search size={14} className={isCompleted ? "text-green-500" : "text-yellow-500"} />
        ) : isFetch ? (
          <Globe size={14} className={isCompleted ? "text-green-500" : "text-yellow-500"} />
        ) : (
          <Wrench size={14} className={isCompleted ? "text-green-500" : "text-yellow-500"} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`flex items-center gap-1.5 text-xs font-medium ${
            isCompleted ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
          }`}
        >
          <span>
            {isCompleted
              ? isSearch
                ? "Search results"
                : isFetch
                  ? "Page content"
                  : "Tool result"
              : isSearch
                ? "Searching"
                : isFetch
                  ? "Fetching"
                  : "Calling tool"}
          </span>
          {!isCompleted && <Loader2 size={12} className="animate-spin" />}
        </div>
        {isCompleted ? (
          <ToolResultContent message={message} />
        ) : (
          <p className="text-xs text-text-muted mt-0.5 font-mono truncate">
            {isSearch && args.query ? `"${args.query}"` : isFetch && args.url ? args.url : JSON.stringify(args)}
          </p>
        )}
      </div>
    </div>
  );
}

function ToolResultContent({ message }: { message: Message }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-text-muted hover:text-text-secondary text-xs flex items-center gap-1 mt-0.5"
        aria-label={expanded ? "Collapse" : "Expand"}
      >
        <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
        {expanded ? "Hide details" : "Show details"}
      </button>
      {expanded && (
        <div className="mt-1 p-2 rounded-lg bg-input border border-input-border text-xs text-text-muted overflow-x-auto max-h-48 overflow-y-auto">
          <pre className="whitespace-pre-wrap break-words font-mono text-[10px]">{message.content.slice(0, 2000)}</pre>
        </div>
      )}
    </div>
  );
}

function ToolCallBubble({ message }: { message: Message }) {
  if (message.toolCall) return <ToolCallDisplay message={message} />;
  if (message.toolResult) return <LegacyToolResultDisplay message={message} />;
  return null;
}

function LegacyToolResultDisplay({ message }: { message: Message }) {
  const { name } = message.toolResult!;
  const isSearch = name === "search_query";
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex items-start gap-2 animate-fade-in">
      <div
        className="shrink-0 w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center mt-0.5"
        aria-hidden="true"
      >
        {isSearch ? <Search size={14} className="text-green-500" /> : <Globe size={14} className="text-green-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
          <span>{isSearch ? "Search results" : "Page content"}</span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-text-muted hover:text-text-secondary"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
        {expanded ? (
          <div className="mt-1 p-2 rounded-lg bg-input border border-input-border text-xs text-text-muted overflow-x-auto max-h-48 overflow-y-auto">
            <pre className="whitespace-pre-wrap break-words font-mono text-[10px]">{message.content.slice(0, 2000)}</pre>
          </div>
        ) : (
          <p className="text-[10px] text-text-muted mt-0.5 truncate">{message.content.slice(0, 120)}...</p>
        )}
      </div>
    </div>
  );
}

function ReasoningBubble({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const hasContent = content.length > 0;

  return (
    <div className="flex items-start gap-2 animate-fade-in mb-2">
      <div
        className="shrink-0 w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mt-0.5"
        aria-hidden="true"
      >
        <Sparkles size={14} className="text-purple-500" />
      </div>
      <div className="flex-1 min-w-0">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          aria-label={expanded ? "Collapse reasoning" : "Expand reasoning"}
        >
          <span>Reasoning</span>
          {isStreaming && <Loader2 size={12} className="animate-spin text-purple-500" />}
          <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
        {expanded ? (
          <div className="mt-1.5 p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/15 text-xs text-text-secondary overflow-x-auto max-h-48 overflow-y-auto">
            <p className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed">
              {content || "Thinking..."}
            </p>
          </div>
        ) : hasContent ? (
          <p className="text-[10px] text-text-muted mt-0.5 truncate italic">
            {content.slice(0, 120)}
            {content.length > 120 && "..."}
          </p>
        ) : (
          <p className="text-[10px] text-text-muted mt-0.5 italic">Analyzing...</p>
        )}
      </div>
    </div>
  );
}

const MessageBubble = memo(function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const isTool = message.role === "tool";
  const isThought = message.role === "assistant" && !!message.thoughtProcess;
  const hasReasoning = message.role === "assistant" && message.content.includes("<reasoning>");
  const [hovered, setHovered] = useState(false);

  if (isTool) {
    return <ToolCallBubble message={message} />;
  }

  if (isThought) {
    return (
      <div className="flex justify-start gap-3 animate-fade-in">
        <div
          className="shrink-0 w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mt-0.5"
          aria-hidden="true"
        >
          <Bot size={14} className="text-accent" />
        </div>
        <div className="max-w-[80%]">
          <ReasoningBubble content={message.thoughtProcess!} isStreaming={message.isStreaming} />
        </div>
      </div>
    );
  }

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

  let reasoningContent = "";
  let displayContent = message.content;
  if (hasReasoning) {
    const reasoningMatch = message.content.match(/<reasoning>([\s\S]*?)<\/reasoning>/);
    if (reasoningMatch) {
      reasoningContent = reasoningMatch[1].trim();
      displayContent = message.content.replace(/<reasoning>[\s\S]*?<\/reasoning>/, "").trim();
    }
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
        className={`shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center mt-0.5 ${
          message.isStreaming ? "bg-accent/20 border-accent/30" : "bg-accent/10 border-accent/20"
        }`}
        aria-hidden="true"
      >
        {message.isStreaming ? (
          <Loader2 size={14} className="text-accent animate-spin" />
        ) : (
          <Bot size={14} className="text-accent" />
        )}
      </div>
      <div className="relative max-w-[80%] text-sm text-text-primary leading-relaxed">
        {hasReasoning && <ReasoningBubble content={reasoningContent} isStreaming={message.isStreaming} />}
        <div className="markdown-body">
          {message.isStreaming && displayContent.length === 0 && !hasReasoning ? (
            <div className="flex items-center gap-2.5 py-1">
              <Loader2 size={14} className="text-accent animate-spin" />
              <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                <span>Thinking</span>
                <span className="generating-dots">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            </div>
          ) : displayContent.length > 0 ? (
            <>
              <MessageContent content={displayContent} isStreaming={!!message.isStreaming} />
              {!message.isStreaming && hovered && (
                <div className="absolute -top-1 right-0">
                  <CopyButton text={displayContent} />
                </div>
              )}
            </>
          ) : null}
        </div>
        {message.sources && message.sources.length > 0 && !message.isStreaming && (
          <SourcesList sources={message.sources} />
        )}
      </div>
    </div>
  );
});

const VIRTUALIZED_THRESHOLD = 50;

export default function ChatArea({ messages, onSuggestionClick, isAtBottom, setIsAtBottom, virtuosoRef }: ChatAreaProps) {
  if (messages.length === 0) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center select-none animate-slide-up relative"
        role="region"
        aria-label="Empty chat — type a message to begin"
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
          <button
            onClick={onSuggestionClick}
            className="mt-2 flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-border bg-surface/50 hover:bg-hover text-text-secondary hover:text-text-primary text-xs font-medium transition-all duration-150 text-left min-h-[44px]"
            aria-label="Enable web search"
          >
            <span className="text-accent shrink-0" aria-hidden="true">
              <Search size={14} />
            </span>
            Enable Web Search
          </button>
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
      </div>
    );
  }

  return <NonVirtualizedChatArea messages={messages} isAtBottom={isAtBottom} setIsAtBottom={setIsAtBottom} />;
}

function NonVirtualizedChatArea({
  messages,
  setIsAtBottom,
}: {
  messages: Message[];
  isAtBottom: boolean;
  setIsAtBottom: (v: boolean) => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onScroll = () => {
      const target = scrollContainerRef.current;
      if (!target) return;
      const atBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
      setIsAtBottom(atBottom);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [setIsAtBottom]);

  return (
    <div
      ref={scrollContainerRef}
      data-chat-scroll
      className="flex-1 overflow-y-auto px-4 md:px-0 relative"
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
    >
      <div className="max-w-3xl mx-auto py-8 space-y-6">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div aria-hidden="true" className="h-1" />
      </div>
    </div>
  );
}
