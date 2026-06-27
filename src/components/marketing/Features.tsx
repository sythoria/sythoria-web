"use client";

import {
  Activity,
  Server,
  Minimize2,
  Heart,
  Sparkles,
  Lock,
  KeyRound,
} from "lucide-react";
import { useScrollInView } from "@/hooks/useScrollInView";
import BentoCard from "./BentoCard";
import InteractiveGlowSphere from "./InteractiveGlowSphere";

/* ════════════════════════════════════════════
   Data-flow (key → lock) privacy animation
   ════════════════════════════════════════════ */
function PrivacyVisualization() {
  return (
    <div className="relative w-full flex-1 min-h-[160px] flex items-center justify-center">
      {/* Local boundary */}
      <div className="relative w-full max-w-[260px] h-24 rounded-xl border border-dashed border-[#8E9DCC]/40 flex items-center justify-between px-8">
        <span className="absolute -top-2.5 left-4 text-[9px] font-mono tracking-wider uppercase text-[#8E9DCC] bg-landing-card px-2">
          local only
        </span>

        {/* Key icon */}
        <div className="w-10 h-10 rounded-full bg-[#D9DBF1]/30 border border-[#8E9DCC]/30 flex items-center justify-center z-10">
          <KeyRound size={16} className="text-[#8E9DCC]" />
        </div>

        {/* Animated dots flowing between key and lock */}
        <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-px">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="absolute top-0 w-1.5 h-1.5 rounded-full bg-[#8E9DCC] opacity-60"
              style={{
                animation: "data-flow 2.4s ease-in-out infinite",
                animationDelay: `${i * 0.48}s`,
              }}
            />
          ))}
        </div>

        {/* Lock icon */}
        <div className="w-10 h-10 rounded-full bg-[#D9DBF1]/30 border border-[#8E9DCC]/30 flex items-center justify-center z-10">
          <Lock size={16} className="text-[#8E9DCC]" />
        </div>
      </div>

      {/* Inline keyframe for data flow */}
      <style>{`
        @keyframes data-flow {
          0%   { transform: translateX(20px); opacity: 0; }
          10%  { opacity: 0.8; }
          90%  { opacity: 0.8; }
          100% { transform: translateX(165px); opacity: 0; }
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
}

const smallFeatures: SmallFeature[] = [
  {
    icon: Activity,
    title: "Streaming Responses",
    description:
      "Real-time streaming with SSE — watch responses arrive token by token, just like the API intended.",
    code: "stream: true  // SSE token-by-token",
    accentColor: "#f43f5e",
  },
  {
    icon: Server,
    title: "Zero Config Servers",
    description:
      "Works with local models via Ollama out of the box. No sign-up, no cloud dependency.",
    code: "ollama.connect('localhost:11434')",
    accentColor: "#f59e0b",
  },
  {
    icon: Minimize2,
    title: "Lightweight",
    description:
      "Minimal footprint, instant load. No Electron, no heavy frameworks — just a lean desktop app.",
    code: "bundle_size: '< 200kb'  // no electron",
    accentColor: "#10b981",
  },
  {
    icon: Heart,
    title: "Free & Open Source",
    description:
      "No subscriptions, no paywalls, no feature gates. Fully open source under a permissive license.",
    code: "license: 'MIT'  // free forever",
    accentColor: "#8b5cf6",
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
              Skills
            </span>
          </div>
          <h2
            className={`mt-4 text-3xl sm:text-4xl font-bold text-text-primary tracking-[-0.035em] scroll-animate scroll-fade-in-up stagger-2 ${visible ? "in-view" : ""}`}
          >
            One interface, every provider
          </h2>
          <p
            className={`mt-3 text-text-secondary max-w-lg mx-auto text-base leading-[1.6] font-light scroll-animate scroll-fade-in-up stagger-3 ${visible ? "in-view" : ""}`}
          >
            Sythoria unifies your AI workflows under a single, privacy-first
            interface.
          </p>
        </div>

        {/* ── Bento grid ── */}
        <div className="bento-grid">
          {/* ═══ Card 1 — Multi-Provider Chat (lg) ═══ */}
          <BentoCard size="lg" accentColor="var(--color-accent)" delay={0}>
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              Multi-Provider Chat
            </h3>
            <p className="text-sm text-text-secondary font-light leading-relaxed mb-4">
              Connect to OpenAI, Anthropic, Google Gemini, Ollama, NVIDIA NIM,
              OpenRouter, or any OpenAI-compatible API — all through one unified
              interface.
            </p>
            <div className="flex-1 flex items-center justify-center">
              <InteractiveGlowSphere />
            </div>
          </BentoCard>

          {/* ═══ Card 2 — Privacy (lg) ═══ */}
          <BentoCard size="lg" accentColor="#8E9DCC" delay={0.1}>
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              Your Keys, Your Control
            </h3>
            <p className="text-sm text-text-secondary font-light leading-relaxed mb-4">
              API keys stay on your local device. No server-side storage, no
              third-party access, no telemetry. Your data never leaves your
              device.
            </p>
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
                <div className="flex items-center gap-3 mb-3">
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
