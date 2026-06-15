"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useScrollInView } from "@/hooks/useScrollInView";

/* ── Static data ──────────────────────────────────── */

const MODELS = ["Claude 4", "GPT-4o", "Gemini 2.5"] as const;
const ACTIVE_MODEL = "Claude 4";

const USER_PROMPT = "Explain quantum computing in simple terms";

const AI_RESPONSE =
  "Quantum computing uses qubits that can exist in multiple states simultaneously — unlike classical bits which are either 0 or 1. This 'superposition' lets quantum computers explore many solutions at once, making them powerful for specific problems like cryptography and drug discovery.";

const TYPING_SPEED_MS = 18; // ms per character

/* ── Component ────────────────────────────────────── */

export default function TerminalShowcase() {
  const shouldReduceMotion = useReducedMotion();
  const { ref: sectionRef, visible: sectionVisible } = useScrollInView(0.15);

  /* ── 3D tilt on scroll ─────────────────────────── */
  const terminalWrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: terminalWrapperRef,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [6, 0, -4]);
  const tiltY = useTransform(scrollYProgress, [0, 1], [10, -10]);

  /* ── Typewriter state ──────────────────────────── */
  const [typedCount, setTypedCount] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [typingStarted, setTypingStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start the animation sequence once in view
  useEffect(() => {
    if (!sectionVisible || typingStarted) return;

    // Brief pause, then show the prompt
    const promptTimer = setTimeout(() => {
      setTypingStarted(true);
      setShowPrompt(true);
    }, 400);

    return () => clearTimeout(promptTimer);
  }, [sectionVisible, typingStarted]);

  // Start the typewriter once the prompt is visible
  useEffect(() => {
    if (!showPrompt) return;

    // Wait a beat after the prompt, then start typing
    const startTimer = setTimeout(() => {
      intervalRef.current = setInterval(
        () => {
          setTypedCount((prev) => {
            if (prev >= AI_RESPONSE.length) {
              if (intervalRef.current) clearInterval(intervalRef.current);
              return prev;
            }
            return prev + 1;
          });
        },
        shouldReduceMotion ? 0 : TYPING_SPEED_MS
      );
    }, 600);

    return () => {
      clearTimeout(startTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [showPrompt, shouldReduceMotion]);

  const isTyping = typedCount < AI_RESPONSE.length && showPrompt;

  /* ── Render ────────────────────────────────────── */

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden px-6 py-24 md:py-32"
    >
      {/* ── Section heading ────────────────────── */}
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={sectionVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4 inline-block font-mono text-xs font-semibold uppercase tracking-[0.25em] text-accent"
        >
          Experience
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={sectionVisible ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.8,
            delay: 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="text-3xl font-bold tracking-tight text-text-primary md:text-5xl"
        >
          See it in action
        </motion.h2>
      </div>

      {/* ── Terminal wrapper (3D perspective) ───── */}
      <div
        ref={terminalWrapperRef}
        className="relative mx-auto max-w-3xl"
        style={{ perspective: 1200 }}
      >
        <motion.div
          style={
            shouldReduceMotion ? undefined : { rotateX, translateY: tiltY }
          }
          className="relative"
        >
          {/* ── Floating labels ──────────────────── */}
          <div className="terminal-label terminal-label-left -right-2 top-12 md:-right-6 z-20 hidden sm:block">
            Real-time Streaming
          </div>
          <div className="terminal-label terminal-label-right -left-2 bottom-16 md:-left-6 z-20 hidden sm:block">
            Markdown Support
          </div>

          {/* ── Terminal frame ────────────────────── */}
          <div className="terminal-frame">
            {/* Header (traffic lights) */}
            <div className="terminal-header">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
              <span className="ml-auto font-mono text-[11px] text-text-muted select-none">
                sythoria
              </span>
            </div>

            {/* Terminal body */}
            <div className="terminal-body">
              {/* ── Model switcher bar ──────────── */}
              <ModelSwitcher />

              {/* ── Conversation ───────────────── */}
              <div className="mt-5 space-y-4">
                {/* User message */}
                {showPrompt && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <span className="terminal-prompt">❯ </span>
                    <span className="text-text-primary">{USER_PROMPT}</span>
                  </motion.div>
                )}

                {/* AI response */}
                {showPrompt && typedCount > 0 && (
                  <div className="terminal-response pl-4 border-l border-border/50">
                    {AI_RESPONSE.slice(0, typedCount)}
                    {isTyping && <span className="terminal-cursor-block" />}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Model switcher sub-component ─────────────────── */

function ModelSwitcher() {
  const [active, setActive] = useState<string>(ACTIVE_MODEL);

  const handleClick = useCallback((model: string) => {
    setActive(model);
  }, []);

  return (
    <div className="flex items-center gap-2 border-b border-border/50 pb-4">
      {MODELS.map((model) => {
        const isActive = model === active;
        return (
          <button
            key={model}
            onClick={() => handleClick(model)}
            className={`rounded-full px-3 py-1 font-mono text-[11px] font-medium transition-all duration-200 ${
              isActive
                ? "bg-accent/20 text-accent shadow-sm shadow-accent/10"
                : "text-text-secondary hover:text-text-primary hover:bg-hover"
            }`}
          >
            {model}
          </button>
        );
      })}
    </div>
  );
}
