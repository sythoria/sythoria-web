"use client";

import { useRef, useEffect, useState } from "react";
import { Download } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";

/* ────────────────────────────────────────── */
/*  Kinetic line entrance                    */
/* ────────────────────────────────────────── */
function SplitLine({
  children,
  delay,
  className = "",
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
}) {
  return (
    <span
      className={`split-text-line ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </span>
  );
}

/* ────────────────────────────────────────── */
/*  Terminal chat teaser                     */
/* ────────────────────────────────────────── */
function TerminalTeaser() {
  return (
    <div className="terminal-frame w-full max-w-md">
      {/* Title bar */}
      <div className="terminal-header">
        <span className="terminal-dot terminal-dot-red" />
        <span className="terminal-dot terminal-dot-yellow" />
        <span className="terminal-dot terminal-dot-green" />
        <span className="ml-auto text-[10px] font-mono text-text-muted tracking-wider">
          sythoria
        </span>
      </div>

      {/* Body */}
      <div className="terminal-body !min-h-0 !p-5 space-y-2 text-[12px] leading-relaxed">
        <p>
          <span className="terminal-prompt">{"> "}</span>
          <span className="text-accent">sythoria launch</span>
        </p>
        <p className="text-text-muted">Initializing Sythoria Desktop...</p>
        <p className="text-[#22c55e]">✓ Local secure storage loaded</p>
        <p className="text-[#22c55e]">✓ Connected to local model (Ollama)</p>
        <p>
          <span className="terminal-prompt">{"> "}</span>
          <span className="terminal-response">
            Ready. Ask anything...
            <span className="terminal-cursor-block" />
          </span>
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   HERO — cinematic split layout
   ════════════════════════════════════════════ */

export default function Hero({
  latestVersion,
}: {
  latestVersion: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── Scroll-driven parallax ── */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const noMotion = isMobile || shouldReduceMotion;
  const yText = useTransform(scrollYProgress, [0, 1], [0, noMotion ? 0 : 120]);
  const yTerminal = useTransform(
    scrollYProgress,
    [0, 1],
    [0, noMotion ? 0 : -80]
  );
  const yCircle = useTransform(
    scrollYProgress,
    [0, 1],
    [0, noMotion ? 0 : 200]
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.7],
    [1, shouldReduceMotion ? 1 : 0]
  );

  /* ── Entrance animation variants ── */
  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] flex items-center px-6 sm:px-10 lg:px-16 overflow-hidden pt-24 pb-16"
    >
      {/* ───── Background decorations ───── */}

      {/* Large circle — top-right */}
      <motion.div
        style={{ y: yCircle, opacity }}
        className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full border border-border/20 bg-gradient-to-br from-glow-primary/30 to-transparent opacity-40 blur-sm"
        aria-hidden
      />

      {/* Horizontal accent lines */}
      <motion.div
        style={{ opacity }}
        className="pointer-events-none absolute top-[30%] left-0 w-full h-px bg-gradient-to-r from-transparent via-border/40 to-transparent"
        aria-hidden
      />
      <motion.div
        style={{ opacity }}
        className="pointer-events-none absolute top-[65%] left-0 w-full h-px bg-gradient-to-r from-transparent via-border/20 to-transparent"
        aria-hidden
      />
      <motion.div
        style={{ opacity }}
        className="pointer-events-none absolute top-[85%] left-0 w-full h-px bg-gradient-to-r from-transparent via-border/10 to-transparent"
        aria-hidden
      />

      {/* ───── Content wrapper — split layout ───── */}
      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-8 z-10">
        {/* ═══ LEFT — typography (60%) ═══ */}
        <motion.div
          style={{ y: yText, opacity }}
          className="flex-[3] flex flex-col items-start text-left"
        >
          {/* Version badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.7, ease }}
            className="mb-8 px-4 py-1.5 rounded-full border border-border/50 bg-surface/50 backdrop-blur-md text-xs font-medium text-text-secondary tracking-widest uppercase flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Zero Telemetry · Bring Your Own Key
          </motion.div>

          {/* Kinetic headline */}
          <h1 className="tracking-tighter leading-[0.92] mb-6">
            <SplitLine
              delay={0.1}
              className="text-5xl sm:text-7xl font-bold text-text-primary"
            >
              The private
            </SplitLine>
            <SplitLine
              delay={0.3}
              className="text-6xl sm:text-8xl font-bold gradient-text-accent"
            >
              interface
            </SplitLine>
            <SplitLine
              delay={0.5}
              className="text-5xl sm:text-7xl font-light text-text-muted"
            >
              for every model.
            </SplitLine>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.9, ease }}
            className="text-lg text-text-secondary font-light max-w-xl leading-relaxed mb-10"
          >
            A deeply personal, high-precision instrument for AI interaction.
            Connects to OpenAI, Anthropic, Gemini, Ollama, and any compatible
            API.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.8, ease }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
          >
            <Link
              href="https://github.com/sythoria/sythoria-desktop/releases/latest"
              className="magnetic-btn group relative flex items-center justify-center gap-2.5 px-8 py-4 bg-text-primary text-surface rounded-full font-medium transition-transform hover:scale-105"
            >
              <Download size={18} />
              <span>
                Download Desktop{" "}
                {latestVersion ? `v${latestVersion.replace(/^v/, "")}` : ""}
              </span>
              <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-chrome-glow transition-colors pointer-events-none" />
            </Link>
          </motion.div>
        </motion.div>

        {/* ═══ RIGHT — terminal teaser (40%) ═══ */}
        <motion.div
          style={{ y: yTerminal }}
          initial={{ opacity: 0, x: 40, rotateY: -8 }}
          animate={{ opacity: 1, x: 0, rotateY: -5 }}
          transition={{ delay: 0.5, duration: 1.2, ease }}
          className="flex-[2] flex justify-center lg:justify-end w-full"
        >
          <div
            className="relative"
            style={{
              perspective: "1000px",
            }}
          >
            {/* Glow behind terminal */}
            <div
              className="absolute -inset-12 rounded-3xl opacity-50 blur-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, var(--color-glow-primary), transparent 70%)",
              }}
              aria-hidden
            />

            <div
              style={{
                transform: "rotateY(-5deg) rotateX(3deg)",
              }}
            >
              <TerminalTeaser />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
