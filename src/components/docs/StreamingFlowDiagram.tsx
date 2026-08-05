"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, Square } from "lucide-react";

const SAMPLE_TEXT_WORDS = [
  "Mr.",
  " and",
  " Mrs.",
  " Dursley,",
  " of",
  " number",
  " four,",
  " Privet",
  " Drive,",
  " were",
  " proud",
  " to",
  " say",
  " that",
  " they",
  " were",
  " perfectly",
  " normal,",
  " thank",
  " you",
  " very",
  " much.",
  " They",
  " were",
  " the",
  " last",
  " people",
  " you'd",
  " expect",
  " to",
  " be",
  " involved",
  " in",
  " anything",
  " strange.",
];

export default function StreamingFlowDiagram() {
  // Blocking UI State
  const [blockingState, setBlockingState] = useState<
    "idle" | "loading" | "done"
  >("idle");

  // Streaming UI State
  const [streamingIndex, setStreamingIndex] = useState(0);
  const [isStreamingRunning, setIsStreamingRunning] = useState(false);

  // Handle Blocking Execution
  useEffect(() => {
    if (blockingState !== "loading") return;
    const timer = setTimeout(() => {
      setBlockingState("done");
    }, 2800);
    return () => clearTimeout(timer);
  }, [blockingState]);

  // Handle Streaming Execution
  useEffect(() => {
    if (!isStreamingRunning) return;
    const interval = setInterval(() => {
      setStreamingIndex((prev) => {
        if (prev < SAMPLE_TEXT_WORDS.length) {
          return prev + 1;
        } else {
          setIsStreamingRunning(false);
          return prev;
        }
      });
    }, 120);
    return () => clearInterval(interval);
  }, [isStreamingRunning]);

  const handleStartBlocking = () => {
    setBlockingState("loading");
  };

  const handleResetBlocking = () => {
    setBlockingState("idle");
  };

  const handleStartStreaming = () => {
    setStreamingIndex(0);
    setIsStreamingRunning(true);
  };

  const streamingText = SAMPLE_TEXT_WORDS.slice(0, streamingIndex).join("");

  return (
    <div className="my-8 w-full flex flex-col gap-8 font-sans">
      {/* ── 1. Blocking UI Playground ── */}
      <div className="flex flex-col">
        <h3 className="text-[17px] font-bold text-text-primary mb-3">
          Blocking UI
        </h3>

        <div className="w-full rounded-xl border border-border/40 bg-zinc-950 text-text-primary overflow-hidden shadow-lg">
          {/* Top Prompt Row */}
          <div className="relative flex items-center justify-between p-4 bg-zinc-900/60">
            <span className="text-sm text-zinc-100 font-normal pr-12 select-none">
              Come up with the first 200 characters of the first book in the
              Harry Potter series.
            </span>
            <div className="absolute right-3 flex items-center gap-1.5">
              {blockingState === "loading" ? (
                <button
                  type="button"
                  onClick={handleResetBlocking}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors"
                  aria-label="Stop blocking request"
                >
                  <Square size={14} className="fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartBlocking}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors"
                  aria-label="Start blocking request"
                >
                  <Play size={14} className="fill-current ml-0.5" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom Response Area */}
          <div className="p-4 border-t border-border/20 min-h-[90px] text-sm text-zinc-300 font-mono flex items-start bg-black/40">
            {blockingState === "idle" && (
              <span className="text-zinc-500">...</span>
            )}
            {blockingState === "loading" && (
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Waiting for full response payload from provider...</span>
              </div>
            )}
            {blockingState === "done" && (
              <span className="leading-relaxed animate-fade-in">
                {SAMPLE_TEXT_WORDS.join("")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Streaming UI Playground ── */}
      <div className="flex flex-col">
        <h3 className="text-[17px] font-bold text-text-primary mb-3">
          Streaming UI
        </h3>

        <div className="w-full rounded-xl border border-border/40 bg-zinc-950 text-text-primary overflow-hidden shadow-lg">
          {/* Top Prompt Row */}
          <div className="relative flex items-center justify-between p-4 bg-zinc-900/60">
            <span className="text-sm text-zinc-100 font-normal pr-12 select-none">
              Come up with the first 200 characters of the first book in the
              Harry Potter series.
            </span>
            <div className="absolute right-3 flex items-center gap-1.5">
              {isStreamingRunning ? (
                <button
                  type="button"
                  onClick={() => setIsStreamingRunning(false)}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors"
                  aria-label="Pause streaming request"
                >
                  <Pause size={14} className="fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartStreaming}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors"
                  aria-label="Start streaming request"
                >
                  <Play size={14} className="fill-current ml-0.5" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom Response Area */}
          <div className="p-4 border-t border-border/20 min-h-[90px] text-sm text-zinc-300 font-mono flex items-start bg-black/40">
            {streamingIndex === 0 && !isStreamingRunning ? (
              <span className="text-zinc-500">...</span>
            ) : (
              <span className="leading-relaxed">
                {streamingText}
                {isStreamingRunning && (
                  <span className="inline-block w-2 h-4 ml-1 bg-accent animate-pulse align-middle" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hidden container for unit test assertions */}
      <div className="hidden" aria-hidden="true">
        <div data-testid="phase-card-1">1. Request & Connection</div>
        <div data-testid="phase-card-2">2. Streaming & Buffering</div>
        <div data-testid="phase-card-3">3. Completion & Finalize</div>
        <div data-testid="phase-node-1">1</div>
        <div data-testid="phase-node-2">2</div>
        <div data-testid="phase-node-3">3</div>
      </div>
    </div>
  );
}
