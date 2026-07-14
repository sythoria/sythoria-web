"use client";

import { useRef, useEffect, useState } from "react";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { GITHUB_OWNER, GITHUB_REPO } from "@/lib/changelog";
import { useTheme } from "@/hooks/useTheme";

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

/* ════════════════════════════════════════════
   HERO — cinematic centered layout with teaser
   ════════════════════════════════════════════ */

export default function Hero({
  latestVersion,
}: {
  latestVersion: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { dark } = useTheme();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const activeDark = mounted ? dark : true;
  const videoSrc = activeDark ? "/darkDemo.mp4" : "/lightDemo.mp4";

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] flex flex-col justify-between items-center px-6 sm:px-10 lg:px-16 overflow-visible pt-32 pb-0"
    >
      {/* ───── Background decorations ───── */}

      {/* Large centered glow */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full opacity-35 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, var(--color-glow-primary) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      {/* Large circle — top-right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.4, scale: 1 }}
        transition={{ delay: 0.2, duration: 1.2 }}
        className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full border border-border/20 bg-gradient-to-br from-glow-primary/30 to-transparent blur-sm"
        aria-hidden
      />

      {/* Horizontal accent lines */}
      <div
        className="pointer-events-none absolute top-[25%] left-0 w-full h-px bg-gradient-to-r from-transparent via-border/40 to-transparent opacity-60"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-[55%] left-0 w-full h-px bg-gradient-to-r from-transparent via-border/20 to-transparent opacity-40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-[75%] left-0 w-full h-px bg-gradient-to-r from-transparent via-border/10 to-transparent opacity-20"
        aria-hidden
      />

      {/* ───── Content wrapper — centered ───── */}
      <div className="max-w-4xl mx-auto w-full flex flex-col items-center text-center justify-start z-10 flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="flex flex-col items-center"
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
          <h1 className="tracking-tighter leading-[1.15] sm:leading-[1.1] md:leading-[1.0] lg:leading-[0.95] mb-6 flex flex-col items-center">
            <SplitLine
              delay={0.1}
              className="text-5xl sm:text-7xl font-bold text-text-primary block"
            >
              The private
            </SplitLine>
            <SplitLine
              delay={0.3}
              className="text-6xl sm:text-8xl font-bold text-accent block"
            >
              interface
            </SplitLine>
            <SplitLine
              delay={0.5}
              className="text-5xl sm:text-7xl font-light text-text-muted block"
            >
              for every model.
            </SplitLine>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.9, ease }}
            className="text-lg sm:text-xl text-text-secondary font-light max-w-2xl leading-relaxed mb-8"
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
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16"
          >
            <Link
              href={`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`}
              target="_blank"
              rel="noopener noreferrer"
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

        {/* ── macOS Demo Showcase ── */}
        <div className="w-full max-w-7xl relative z-20 overflow-visible">
          {/* Ambient glow behind showcase */}
          <div
            className="absolute -inset-10 rounded-2xl opacity-40 blur-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, var(--color-glow-primary), transparent 70%)",
            }}
            aria-hidden
          />

          {/* macOS window frame */}
          <div className="terminal-frame overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="terminal-header">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
              <span className="ml-auto font-mono text-[11px] text-text-muted select-none">
                sythoria
              </span>
            </div>

            {/* Video body */}
            <div className="terminal-body !p-0 overflow-hidden rounded-b-xl aspect-video bg-black flex items-center justify-center">
              <video
                key={videoSrc}
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
