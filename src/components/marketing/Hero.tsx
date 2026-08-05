"use client";

import { useRef, useEffect, useState } from "react";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
import { GITHUB_LATEST_RELEASE_URL } from "@/lib/site-config";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoViewportRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const { dark } = useTheme();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const viewport = videoViewportRef.current;
    if (!viewport) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVideoVisible(entry.isIntersecting),
      { rootMargin: "200px" }
    );
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const videoSrc =
    mounted && videoVisible
      ? dark
        ? "/darkDemo.mp4"
        : "/lightDemo.mp4"
      : undefined;
  const posterSrc = mounted
    ? dark
      ? "/darkDemo-poster.webp"
      : "/lightDemo-poster.webp"
    : undefined;

  // Imperatively control video playback and reset loading state when src changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setVideoLoaded(false);
    if (!videoSrc) {
      video.pause();
      video.removeAttribute("src");
      video.load();
      return;
    }
    video.load();
    if (videoVisible) {
      video.play().catch(() => {
        // The stable placeholder remains visible when autoplay is unavailable.
      });
    }
  }, [videoSrc, videoVisible]);

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] flex flex-col justify-between items-center px-6 sm:px-10 lg:px-16 overflow-visible pt-32 pb-0"
    >
      {/* ───── Background decorations ───── */}

      {/* Large centered glow */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full opacity-35 blur-[120px] animate-ambient-pulse"
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
      <div className="max-w-4xl min-w-0 mx-auto w-full flex flex-col items-center text-center justify-start z-10 flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="flex w-full min-w-0 flex-col items-center"
        >
          {/* Version badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.7, ease }}
            className="mb-8 max-w-full px-4 py-1.5 rounded-full border border-border/50 bg-surface/50 backdrop-blur-md text-[10px] sm:text-xs font-medium text-text-secondary tracking-[0.14em] sm:tracking-widest uppercase flex items-center justify-center gap-2 leading-relaxed"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Zero Telemetry · Bring Your Own Key
          </motion.div>

          {/* Kinetic headline */}
          <h1 className="w-full min-w-0 tracking-tighter leading-[1.15] sm:leading-[1.1] md:leading-[1.0] lg:leading-[0.95] mb-6 flex flex-col items-center">
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
              className="text-[2.5rem] sm:text-7xl font-light text-text-muted block"
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
            A desktop client for OpenAI, Anthropic, Gemini, Ollama, NVIDIA NIM,
            OpenRouter, and compatible APIs. Hosted requests go directly to the
            provider you configure.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.8, ease }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16"
          >
            <motion.a
              href={GITHUB_LATEST_RELEASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              className="shimmer-btn group relative flex items-center justify-center gap-2.5 px-8 py-4 bg-text-primary text-surface rounded-full font-medium shadow-md transition-shadow duration-300 hover:shadow-[0_12px_35px_-5px_var(--color-accent)]"
            >
              <Download size={18} />
              <span>
                Download Desktop{" "}
                {latestVersion ? `v${latestVersion.replace(/^v/, "")}` : ""}
              </span>
              <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-chrome-glow transition-colors pointer-events-none" />
            </motion.a>
          </motion.div>
        </motion.div>

        {/* ── macOS Demo Showcase ── */}
        <div className="w-full min-w-0 max-w-7xl relative z-20 overflow-visible">
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
            <div
              ref={videoViewportRef}
              data-testid="demo-video-viewport"
              className="terminal-body !min-h-0 !p-0 overflow-hidden rounded-b-xl aspect-[4/3] sm:aspect-video bg-surface/90 relative flex items-center justify-center border-t border-border/20"
            >
              {!videoLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-sm z-10 gap-3">
                  <span className="text-xs font-mono text-text-muted">
                    Interface demo
                  </span>
                </div>
              )}
              <video
                ref={videoRef}
                src={videoSrc}
                poster={posterSrc}
                autoPlay
                loop
                muted
                playsInline
                preload={videoSrc ? "metadata" : "none"}
                aria-hidden="true"
                tabIndex={-1}
                onCanPlay={() => setVideoLoaded(true)}
                onLoadedData={() => setVideoLoaded(true)}
                className={`h-full w-[calc(100%+2rem)] max-w-none shrink-0 object-cover object-right sm:w-full sm:object-center transition-opacity duration-500 ${
                  videoLoaded ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
