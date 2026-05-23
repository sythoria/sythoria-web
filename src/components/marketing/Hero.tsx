"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Feather, Lock, Zap } from "lucide-react";

function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
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

export default function Hero() {
  const { ref, visible } = useInView();

  return (
    <section className="relative pt-28 sm:pt-36 pb-20 px-6 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-accent/5 dark:bg-accent/10 blur-[120px] animate-gradient-shift" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/3 dark:bg-accent/6 blur-[80px]" />
      </div>

      <div ref={ref} className="max-w-3xl mx-auto text-center">
        <div
          className={`animate-fade-in-up stagger-1 ${visible ? "" : "opacity-0"}`}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-soft border border-accent/20 text-accent text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Open source &middot; Privacy-first
          </div>
        </div>

        <h1
          className={`animate-fade-in-scale stagger-2 ${visible ? "" : "opacity-0"}`}
        >
          <span className="block text-4xl sm:text-5xl md:text-[3.5rem] font-bold text-text-primary leading-[1.1] tracking-tight">
            One interface.
          </span>
          <span className="block text-4xl sm:text-5xl md:text-[3.5rem] font-bold leading-[1.1] tracking-tight mt-2 bg-gradient-to-r from-accent via-accent-hover to-accent bg-clip-text text-transparent animate-gradient-shift">
            Every AI model.
          </span>
        </h1>

        <p
          className={`mt-6 text-lg sm:text-xl text-text-secondary max-w-xl mx-auto leading-relaxed animate-fade-in-up stagger-3 ${visible ? "" : "opacity-0"}`}
        >
          Sythoria is a lightweight, free chat interface for OpenAI, Anthropic,
          Gemini, Ollama, and any OpenAI-compatible API. No accounts. No
          tracking. Just chat.
        </p>

        <div
          className={`mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up stagger-4 ${visible ? "" : "opacity-0"}`}
        >
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-base font-medium transition-all duration-200 min-h-[48px] animate-border-pulse"
          >
            Try it out
            <ArrowRight size={18} />
          </Link>
          <a
            href="https://github.com/sythoria/sythoria-desktop"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-accent/40 hover:bg-hover text-base font-medium transition-all duration-200 min-h-[48px]"
          >
            <GithubIcon size={18} />
            View on GitHub
          </a>
        </div>

        <div
          className={`mt-14 flex items-center justify-center gap-8 sm:gap-12 animate-fade-in-up stagger-5 ${visible ? "" : "opacity-0"}`}
        >
          {highlights.map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center">
                <Icon size={18} className="text-accent" />
              </div>
              <span className="text-sm font-semibold text-text-primary">
                {label}
              </span>
              <span className="text-xs text-text-muted">{sub}</span>
            </div>
          ))}
        </div>

        <div
          className={`mt-16 animate-fade-in-scale stagger-5 ${visible ? "" : "opacity-0"}`}
        >
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-accent/20 via-transparent to-transparent pointer-events-none" />
            <div className="glass-panel rounded-2xl p-1">
              <div className="rounded-xl bg-chat border border-border/50 p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                  <span className="ml-2 text-xs text-text-muted font-mono">
                    sythoria
                  </span>
                </div>
                <div className="space-y-3 text-left">
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
                  <div className="flex items-center gap-2 pt-1">
                    <div className="h-px flex-1 bg-border/50" />
                    <span className="text-[10px] text-text-muted font-mono">
                      gpt-4o &middot; streaming
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
