"use client";

import React from "react";
import { Mic, Cpu, Cloud, Volume2 } from "lucide-react";

interface Step {
  id: number;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBg: string;
  iconColor: string;
  description: string;
  flowDetails: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: "1. Microphone",
    icon: Mic,
    iconBg: "bg-red-500/10 dark:bg-red-500/15",
    iconColor: "text-red-600 dark:text-red-400 border-red-500/20",
    description: "Captures user PCM voice chunks.",
    flowDetails: "Out: PCM Audio stream",
  },
  {
    id: 2,
    title: "2. Desktop App Core",
    icon: Cpu,
    iconBg: "bg-orange-500/10 dark:bg-orange-500/15",
    iconColor: "text-orange-600 dark:text-orange-400 border-orange-500/20",
    description: "Handles native audio buffers in Rust backend.",
    flowDetails: "Tauri IPC ➔ Network Socket",
  },
  {
    id: 3,
    title: "3. Provider Endpoint",
    icon: Cloud,
    iconBg: "bg-amber-500/10 dark:bg-amber-500/15",
    iconColor: "text-amber-600 dark:text-amber-400 border-amber-500/20",
    description: "AI Provider processes audio in real-time.",
    flowDetails: "In/Out: Low-latency WebSocket",
  },
  {
    id: 4,
    title: "4. Audio Speakers",
    icon: Volume2,
    iconBg: "bg-purple-500/10 dark:bg-purple-500/15",
    iconColor: "text-purple-600 dark:text-purple-400 border-purple-500/20",
    description: "Renders model voice response to system output.",
    flowDetails: "In: PCM Audio play streams",
  },
];

export default function RealtimeAudioFlow() {
  return (
    <div className="my-8 w-full rounded-2xl border border-border/40 bg-surface/20 dark:bg-black/15 backdrop-blur-md p-5 md:p-6 flex flex-col gap-6 select-none shadow-lg overflow-hidden">
      <style>{`
        @keyframes duplexFlow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -24; }
        }
        .flow-line-realtime {
          stroke: var(--theme-accent, #9aa8d6);
          stroke-dasharray: 6 3;
          animation: duplexFlow 1.8s infinite linear;
          filter: drop-shadow(0 0 2px var(--theme-accent, #9aa8d6));
        }
      `}</style>

      {/* Main Grid: Step boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 items-stretch relative">
        {STEPS.map((step) => {
          const StepIcon = step.icon;

          return (
            <div
              key={step.id}
              className="p-5 rounded-xl border border-border/30 bg-surface/30 dark:bg-black/10 text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className={`p-1.5 rounded-lg ${step.iconBg} ${step.iconColor} border`}
                  >
                    <StepIcon size={16} />
                  </div>
                  <h4 className="text-xs md:text-sm font-bold text-text-primary">
                    {step.title}
                  </h4>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mb-3">
                  {step.description}
                </p>
              </div>
              <div className="border-t border-border/10 pt-2 text-[9px] font-mono text-text-muted">
                {step.flowDetails}
              </div>
            </div>
          );
        })}
      </div>

      {/* Curvy Connecting Wave SVG (Desktop only) */}
      <div className="hidden md:block relative w-full h-[60px] bg-black/5 dark:bg-black/25 border border-border/15 rounded-xl">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Wave line connecting columns representing audio flow */}
          <path
            d="M 12.5% 30 C 20% 5, 27% 55, 37.5% 30 C 47% 5, 52% 55, 62.5% 30 C 72% 5, 77% 55, 87.5% 30"
            fill="none"
            stroke="rgba(120, 120, 130, 0.2)"
            strokeWidth="3.5"
            className="flow-line-realtime"
          />
        </svg>

        {/* Indicators */}
        <div className="absolute inset-0 flex justify-between px-[12.5%] items-center">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className="w-8 h-8 rounded-full border border-accent/40 bg-accent/10 text-accent flex items-center justify-center relative z-10"
            >
              <span className="text-xs font-extrabold">{step.id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
