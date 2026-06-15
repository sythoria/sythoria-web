"use client";

import { useRef, useEffect, useState } from "react";
import { Download, Terminal } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";

function GithubIcon({
  size = 18,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

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
          <span className="text-accent">
            sythoria connect --provider anthropic
          </span>
        </p>
        <p className="text-[#22c55e]">✓ Connected to Claude 4 Opus</p>
        <p>
          <span className="terminal-prompt">{"> "}</span>
          <span className="text-accent">
            ask &quot;What makes you unique?&quot;
          </span>
        </p>
        <p className="terminal-response">
          I can engage in nuanced reasoning&hellip;
          <span className="terminal-cursor-block" />
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
              href="https://github.com/sythoria/sythoria-desktop/releases"
              className="magnetic-btn group relative flex items-center justify-center gap-2.5 px-8 py-4 bg-text-primary text-surface rounded-full font-medium transition-transform hover:scale-105"
            >
              <Download size={18} />
              <span>
                Download Desktop{" "}
                {latestVersion ? `v${latestVersion.replace(/^v/, "")}` : ""}
              </span>
              <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-chrome-glow transition-colors pointer-events-none" />
            </Link>

            <Link
              href="/chat"
              className="group flex items-center justify-center gap-2.5 px-8 py-4 bg-landing-card backdrop-blur-xl border border-white/10 dark:border-white/5 text-text-primary rounded-full font-medium transition-all hover:bg-white/10 dark:hover:bg-white/5 hover:scale-105 shadow-xl shadow-black/5"
            >
              <Terminal
                size={18}
                className="text-text-muted group-hover:text-text-primary transition-colors"
              />
              <span>Open Web App</span>
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
