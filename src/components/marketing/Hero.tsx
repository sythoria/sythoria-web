"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Download, Feather, Lock, Zap, Cpu } from "lucide-react";
import { Button, Badge } from "@/components/ui";

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

const highlights = [
  { icon: Feather, label: "Lightweight", sub: "No bloat, no frameworks" },
  { icon: Zap, label: "Free", sub: "Open source, forever" },
  { icon: Lock, label: "Private", sub: "Your keys, your data" },
];

const floatingOrbs = [
  { size: 400, top: "-10%", left: "10%", delay: 0, duration: 8 },
  { size: 300, top: "20%", right: "5%", delay: 2, duration: 10 },
  { size: 250, bottom: "10%", left: "30%", delay: 4, duration: 12 },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function useTilt() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    };

    const handleMouseLeave = () => {
      el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg)";
    };

    el.addEventListener(
      "mousemove",
      handleMouseMove as unknown as EventListener
    );
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener(
        "mousemove",
        handleMouseMove as unknown as EventListener
      );
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return ref;
}

const providers = [
  { name: "OpenAI", color: "from-emerald-400 to-emerald-600" },
  { name: "Anthropic", color: "from-orange-400 to-orange-600" },
  { name: "Gemini", color: "from-blue-400 to-blue-600" },
  { name: "Ollama", color: "from-slate-300 to-slate-500" },
  { name: "NVIDIA", color: "from-green-400 to-green-600" },
  { name: "OpenRouter", color: "from-purple-400 to-purple-600" },
];

const terminalLines = [
  "$ sythoria --init --provider openai",
  "→ connecting to api.openai.com...",
  "→ model loaded: gpt-4o",
  "→ streaming enabled ✓",
  "$ sythoria --init --provider anthropic",
  "→ connecting to api.anthropic.com...",
  "→ model loaded: claude-sonnet-4-20250514",
  "→ privacy mode: local keys only ✓",
  "$ sythoria --config ollama.local",
  "→ scanning localhost:11434...",
  "→ model loaded: llama3.1:70b",
  "→ zero telemetry confirmed ✓",
  "$ sythoria --status",
  "→ providers: 6 connected",
  "→ api keys: local only ✓",
  "→ tracking: disabled ✓",
  "→ subscription: free forever ✓",
];

const terminalBlocks = [
  {
    lines: terminalLines.slice(0, 6),
    top: "8%",
    left: "3%",
    animation: "terminal-scroll-up",
    duration: 28,
    delay: 0,
  },
  {
    lines: terminalLines.slice(6, 12),
    top: "25%",
    right: "2%",
    animation: "terminal-scroll-up-reverse",
    duration: 32,
    delay: 4,
  },
  {
    lines: terminalLines.slice(12, 17),
    bottom: "5%",
    left: "10%",
    animation: "terminal-scroll-up",
    duration: 36,
    delay: 8,
  },
];

export default function Hero() {
  const { ref, visible } = useInView();
  const tiltRef = useTilt();

  return (
    <section className="relative pt-28 sm:pt-40 pb-24 px-6 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="hero-terminal-overlay">
          {terminalBlocks.map((block, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: block.top,
                left: block.left,
                right: block.right,
                bottom: block.bottom,
                width: "44%",
                animation: `${block.animation} ${block.duration}s linear infinite`,
                animationDelay: `${block.delay}s`,
              }}
            >
              <div className="hero-terminal-line text-accent text-[11px] sm:text-xs leading-relaxed">
                {block.lines.map((line, j) => (
                  <span key={j} className="block">
                    {line}
                    {i === 0 && j === block.lines.length - 1 && (
                      <span className="terminal-cursor" />
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {floatingOrbs.map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-accent/5 dark:bg-accent/10 blur-[120px] animate-glow-pulse"
            style={{
              width: orb.size,
              height: orb.size,
              top: orb.top,
              left: orb.left,
              right: orb.right,
              bottom: orb.bottom,
              animationDelay: `${orb.delay}s`,
              animationDuration: `${orb.duration}s`,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-accent)/0.03_0%,_transparent_70%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-chat to-transparent" />
      </div>

      <div ref={ref} className="max-w-4xl mx-auto text-center">
        <div
          className={`animate-fade-in-up stagger-1 ${visible ? "" : "opacity-0"}`}
        >
          <Badge dot>Open source · Privacy-first</Badge>
        </div>

        <h1
          className={`mt-8 animate-fade-in-scale stagger-2 ${visible ? "" : "opacity-0"}`}
        >
          <span className="block text-5xl sm:text-6xl md:text-7xl font-semibold text-text-primary leading-[1.08] tracking-[-0.035em]">
            One interface.
          </span>
          <span className="block text-5xl sm:text-6xl md:text-7xl font-semibold leading-[1.08] tracking-[-0.035em] mt-2 landing-gradient-text">
            Every AI model.
          </span>
        </h1>

        <p
          className={`mt-8 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-[1.65] font-light tracking-[-0.01em] animate-fade-in-up stagger-3 ${visible ? "" : "opacity-0"}`}
        >
          Sythoria is a lightweight, free chat interface for OpenAI, Anthropic,
          Gemini, Ollama, and any OpenAI-compatible API. No accounts. No
          tracking. Just chat.
        </p>

        <div
          className={`mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-4 ${visible ? "" : "opacity-0"}`}
        >
          <Button
            variant="primary"
            size="lg"
            href="https://github.com/sythoria/sythoria-desktop/releases"
            icon={<Download size={18} />}
          >
            Download
          </Button>
          <Button
            variant="secondary"
            size="lg"
            href="https://github.com/sythoria/sythoria-desktop"
            icon={
              <GithubIcon size={18} className="inline-block align-middle" />
            }
          >
            View on GitHub
          </Button>
        </div>

        <div
          className={`mt-16 flex items-center justify-center gap-8 sm:gap-14 animate-fade-in-up stagger-5 ${visible ? "" : "opacity-0"}`}
        >
          {highlights.map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-accent-soft border border-accent/10 flex items-center justify-center">
                <Icon size={20} className="text-accent" />
              </div>
              <span className="text-sm font-semibold text-text-primary">
                {label}
              </span>
              <span className="text-xs text-text-muted">{sub}</span>
            </div>
          ))}
        </div>

        <div
          className={`mt-20 animate-tilt-in stagger-5 ${visible ? "" : "opacity-0"}`}
        >
          <div
            ref={tiltRef}
            className="relative max-w-2xl mx-auto transition-transform duration-300 ease-out preserve-3d"
          >
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-b from-accent/20 via-accent/5 to-transparent pointer-events-none blur-sm" />
            <div className="relative glass-panel rounded-2xl p-1.5 shadow-2xl shadow-accent/5">
              <div className="rounded-xl bg-chat border border-border/50 overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-border/30">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                  <span className="ml-3 text-xs text-text-muted font-mono">
                    sythoria
                  </span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <Cpu size={12} className="text-text-muted" />
                    <span className="text-[10px] text-text-muted font-mono">
                      gpt-4o
                    </span>
                  </div>
                </div>
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex gap-3">
                    <span className="text-xs text-text-muted font-mono shrink-0 pt-0.5">
                      you
                    </span>
                    <p className="text-sm text-text-secondary">
                      Explain quantum entanglement in simple terms
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-xs text-accent font-mono shrink-0 pt-0.5">
                      ai
                    </span>
                    <div className="text-sm text-text-secondary leading-relaxed">
                      <p>
                        Imagine you have two coins. When you flip them, they
                        always land on the same side — even if you take one to
                        Mars. That&apos;s entanglement: two particles linked so
                        that measuring one{" "}
                        <span className="text-accent font-medium">
                          instantly determines
                        </span>{" "}
                        the state of the other, regardless of distance.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="h-px flex-1 bg-border/50" />
                    <span className="text-[10px] text-text-muted font-mono">
                      streaming · 142 tokens
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`mt-16 animate-fade-in-up stagger-5 ${visible ? "" : "opacity-0"}`}
        >
          <p className="text-xs text-text-muted uppercase tracking-widest mb-6 font-medium">
            Works with your favorite providers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {providers.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border/50 text-sm text-text-secondary hover:border-accent/30 hover:text-text-primary transition-all duration-200"
              >
                <div
                  className={`w-2 h-2 rounded-full bg-gradient-to-r ${p.color}`}
                />
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
