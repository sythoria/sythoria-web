"use client";

import {
  Columns3,
  FolderGit2,
  Mic,
  Search,
  Sparkles,
  Lock,
  KeyRound,
} from "lucide-react";
import Link from "next/link";
import { useScrollInView } from "@/hooks/useScrollInView";
import BentoCard from "./BentoCard";
import InteractiveGlowSphere from "./InteractiveGlowSphere";

/* ════════════════════════════════════════════
   Data-flow (key → lock) privacy animation
   ════════════════════════════════════════════ */
function PrivacyVisualization() {
  return (
    <div className="relative w-full flex-1 min-h-[160px] flex items-center justify-center select-none">
      {/* Local boundary */}
      <div className="relative w-full max-w-[280px] h-24 rounded-xl border border-dashed border-[#8E9DCC]/40 flex items-center justify-between px-8 bg-surface/30 backdrop-blur-sm shadow-sm">
        <span className="absolute -top-2.5 left-4 text-[9px] font-mono tracking-wider uppercase text-[#8E9DCC] bg-landing-card px-2 rounded">
          local credential storage
        </span>

        {/* Key icon */}
        <div className="w-10 h-10 rounded-full bg-[#D9DBF1]/30 border border-[#8E9DCC]/30 flex items-center justify-center z-10 shadow-inner group-hover:scale-105 transition-transform duration-300">
          <KeyRound size={16} className="text-[#8E9DCC]" />
        </div>

        {/* Animated dots flowing between key and lock */}
        <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-0.5 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="absolute top-0 -translate-y-1/2 w-2 h-2 rounded-full bg-[#8E9DCC] shadow-[0_0_8px_#8E9DCC]"
              style={{
                animation:
                  "data-flow-responsive 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                animationDelay: `${i * 0.55}s`,
              }}
            />
          ))}
        </div>

        {/* Lock icon */}
        <div className="w-10 h-10 rounded-full bg-[#D9DBF1]/30 border border-[#8E9DCC]/30 flex items-center justify-center z-10 shadow-inner group-hover:scale-105 transition-transform duration-300">
          <Lock size={16} className="text-[#8E9DCC]" />
        </div>
      </div>

      {/* Inline keyframe for data flow */}
      <style>{`
        @keyframes data-flow-responsive {
          0%   { left: 0%; opacity: 0; transform: scale(0.5); }
          15%  { opacity: 0.9; transform: scale(1); }
          85%  { opacity: 0.9; transform: scale(1); }
          100% { left: 100%; opacity: 0; transform: scale(0.5); }
        }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════
   Feature data
   ════════════════════════════════════════════ */
interface SmallFeature {
  icon: React.ElementType;
  title: string;
  description: string;
  code: string;
  accentColor: string;
  href: string;
}

const smallFeatures: SmallFeature[] = [
  {
    icon: FolderGit2,
    title: "Project Workspaces",
    description:
      "Let the agent read a project, review proposed edits, and apply approved changes from an isolated worktree.",
    code: "permissions: read | write | full",
    accentColor: "#f43f5e",
    href: "/docs/features/project-workspaces",
  },
  {
    icon: Search,
    title: "Search and Fetch",
    description:
      "Search with Google, SearXNG, or Firecrawl, then fetch readable page content with Firecrawl or Jina.",
    code: "search: google | searxng | firecrawl",
    accentColor: "#f59e0b",
    href: "/docs/features/web-search",
  },
  {
    icon: Columns3,
    title: "Model Comparison",
    description:
      "Send one prompt to several configured models and read their responses side by side.",
    code: "layout: parallel columns",
    accentColor: "#10b981",
    href: "/docs/features/comparison-grid",
  },
  {
    icon: Mic,
    title: "Voice and Appshots",
    description:
      "Transcribe up to five minutes of speech and attach a confirmed capture of the frontmost app window.",
    code: "input: voice | appshot",
    accentColor: "#8b5cf6",
    href: "/docs/features/voice",
  },
];

/* ════════════════════════════════════════════
   FEATURES SECTION
   ════════════════════════════════════════════ */
export default function Features() {
  const { ref, visible } = useScrollInView();

  return (
    <section id="features" className="py-20 px-6 relative">
      <div className="landing-section-divider mb-20" />

      <div ref={ref} className="max-w-6xl mx-auto">
        {/* ── Section heading ── */}
        <div className="text-center mb-14">
          <div
            className={`scroll-animate scroll-fade-in-up stagger-1 ${visible ? "in-view" : ""}`}
          >
            <span className="text-xs font-medium uppercase tracking-widest text-accent flex items-center justify-center gap-2">
              <Sparkles size={13} strokeWidth={1.5} />
              Desktop features
            </span>
          </div>
          <h2
            className={`mt-4 text-3xl sm:text-4xl font-bold text-text-primary tracking-[-0.035em] scroll-animate scroll-fade-in-up stagger-2 ${visible ? "in-view" : ""}`}
          >
            Models, tools, and local projects
          </h2>
          <p
            className={`mt-3 text-text-secondary max-w-lg mx-auto text-base leading-[1.6] font-light scroll-animate scroll-fade-in-up stagger-3 ${visible ? "in-view" : ""}`}
          >
            Configure local or hosted providers, then choose a model for each
            workflow.
          </p>
        </div>

        {/* ── Bento grid ── */}
        <div className="bento-grid">
          {/* ═══ Card 1 — Multi-Provider Chat (lg) ═══ */}
          <BentoCard size="lg" accentColor="var(--color-accent)" delay={0}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  Multi-Provider Chat
                </h3>
                <p className="text-sm text-text-secondary font-light leading-relaxed mb-4">
                  Connect to OpenAI, Anthropic, Google Gemini, Ollama, NVIDIA
                  NIM, OpenRouter, or another OpenAI-compatible API from the
                  same desktop app.
                </p>
              </div>
              <Link
                href="/docs/features/multi-provider"
                className="text-xs font-medium text-accent hover:text-accent-hover transition-colors shrink-0 ml-4 hidden sm:inline-flex items-center gap-1 group-hover:underline"
                aria-label="Read Multi-Provider Chat documentation"
              >
                Docs <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <InteractiveGlowSphere />
            </div>
          </BentoCard>

          {/* ═══ Card 2 — Privacy (lg) ═══ */}
          <BentoCard size="lg" accentColor="#8E9DCC" delay={0.1}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  Your Keys, Your Control
                </h3>
                <p className="text-sm text-text-secondary font-light leading-relaxed mb-4">
                  Sythoria encrypts its local secrets file and stores the root
                  key in your operating system credential vault. Prompts sent to
                  a hosted model still leave your device and are handled under
                  that provider&apos;s terms. Sythoria does not add its own
                  prompt relay.
                </p>
              </div>
              <Link
                href="/docs/privacy"
                className="text-xs font-medium text-accent hover:text-accent-hover transition-colors shrink-0 ml-4 hidden sm:inline-flex items-center gap-1 group-hover:underline"
                aria-label="Read Privacy and Security documentation"
              >
                Docs <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <PrivacyVisualization />
            </div>
          </BentoCard>

          {/* ═══ Small cards ═══ */}
          {smallFeatures.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <BentoCard
                key={feat.title}
                size="sm"
                accentColor={feat.accentColor}
                delay={0.15 + i * 0.08}
              >
                {/* Header: icon · title */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full border flex items-center justify-center shrink-0"
                      style={{
                        background: `${feat.accentColor}12`,
                        borderColor: `${feat.accentColor}30`,
                      }}
                    >
                      <Icon
                        size={15}
                        strokeWidth={1.5}
                        style={{ color: feat.accentColor }}
                      />
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      {feat.title}
                    </h3>
                  </div>
                  <Link
                    href={feat.href}
                    className="text-[11px] font-medium text-text-muted hover:text-accent transition-colors flex items-center gap-0.5 opacity-75 group-hover:opacity-100"
                    aria-label={`Read ${feat.title} guide`}
                  >
                    Guide <span aria-hidden="true">→</span>
                  </Link>
                </div>

                {/* Description */}
                <p className="text-sm text-text-secondary font-light leading-relaxed flex-1">
                  {feat.description}
                </p>

                {/* Code snippet */}
                <div className="mt-4 pt-3 border-t border-border/10">
                  <code className="text-[11px] font-mono text-text-muted block truncate opacity-70">
                    {feat.code}
                  </code>
                </div>
              </BentoCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
