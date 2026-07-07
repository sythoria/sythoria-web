"use client";

import React from "react";
import { Terminal, Brain, ShieldAlert, PlayCircle } from "lucide-react";

interface Step {
  id: number;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBg: string;
  iconColor: string;
  description: string;
  details: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: "1. Prompt Input",
    icon: Terminal,
    iconBg: "bg-blue-500/10 dark:bg-blue-500/15",
    iconColor: "text-blue-600 dark:text-blue-400 border-blue-500/20",
    description: "User submits instructions or project goal.",
    details:
      "Sythoria compiles system prompts, registers workspace limits, and loads active guidelines.",
  },
  {
    id: 2,
    title: "2. LLM Reasoning",
    icon: Brain,
    iconBg: "bg-orange-500/10 dark:bg-orange-500/15",
    iconColor: "text-orange-600 dark:text-orange-400 border-orange-500/20",
    description: "LLM analyzes workspace context & plans steps.",
    details:
      "Streams reasoning text, selects tools, and packages call arguments dynamically.",
  },
  {
    id: 3,
    title: "3. Consent Gate",
    icon: ShieldAlert,
    iconBg: "bg-amber-500/10 dark:bg-amber-500/15",
    iconColor: "text-amber-600 dark:text-amber-400 border-amber-500/20",
    description: "Human-In-The-Loop safety gate validation.",
    details:
      "Auto-approves read tools; prompts manual confirmation for write and shell command executions.",
  },
  {
    id: 4,
    title: "4. Execution Sandbox",
    icon: PlayCircle,
    iconBg: "bg-purple-500/10 dark:bg-purple-500/15",
    iconColor: "text-purple-600 dark:text-purple-400 border-purple-500/20",
    description: "Runs tool locally & feeds output back to LLM.",
    details:
      "Executes in a secure environment, returns logs or edits, and triggers next reasoning iteration.",
  },
];

export default function AgenticLoopDiagram() {
  return (
    <div className="my-8 w-full rounded-2xl border border-border/40 bg-surface/20 dark:bg-black/15 backdrop-blur-md p-5 md:p-6 flex flex-col gap-6 select-none shadow-lg overflow-hidden">
      <style>{`
        @keyframes dashFlow {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        .loop-line {
          stroke: var(--theme-accent, #9aa8d6);
          stroke-dasharray: 6 4;
          animation: dashFlow 1.5s infinite linear;
          filter: drop-shadow(0 0 2px var(--theme-accent, #9aa8d6));
        }
      `}</style>

      {/* Grid Layout of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 items-stretch relative">
        {STEPS.map((step) => {
          const StepIcon = step.icon;

          return (
            <div
              key={step.id}
              className="p-5 rounded-xl border border-border/30 bg-surface/30 dark:bg-black/10 text-left flex flex-col justify-between relative z-10"
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
                <p className="text-xs font-semibold text-text-primary mb-2">
                  {step.description}
                </p>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  {step.details}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* SVG Connecting Flow Lines (Desktop Only) */}
      <div className="hidden md:block relative w-full h-[60px] bg-black/5 dark:bg-black/25 border border-border/15 rounded-xl">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main forward flow curves */}
          {/* 1 -> 2 */}
          <path
            d="M 12.5% 30 C 18% 10, 24% 50, 37.5% 30"
            fill="none"
            stroke="rgba(120, 120, 130, 0.2)"
            strokeWidth="3"
            className="loop-line"
          />
          {/* 2 -> 3 */}
          <path
            d="M 37.5% 30 C 43% 10, 49% 50, 62.5% 30"
            fill="none"
            stroke="rgba(120, 120, 130, 0.2)"
            strokeWidth="3"
            className="loop-line"
          />
          {/* 3 -> 4 */}
          <path
            d="M 62.5% 30 C 68% 10, 74% 50, 87.5% 30"
            fill="none"
            stroke="rgba(120, 120, 130, 0.2)"
            strokeWidth="3"
            className="loop-line"
          />

          {/* Loop-back curve from 4 back to 2 (Reasoning) */}
          <path
            d="M 87.5% 30 C 75% 65, 50% 65, 37.5% 30"
            fill="none"
            stroke="rgba(120, 120, 130, 0.2)"
            strokeWidth="3.5"
            className="loop-line"
          />
        </svg>

        {/* Node Indicators on the paths */}
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
