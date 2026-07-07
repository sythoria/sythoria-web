"use client";

import React from "react";
import { MessageSquare, Binary, CheckCircle } from "lucide-react";

interface SubStep {
  label: string;
  flow: string;
}

interface Phase {
  id: number;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBg: string;
  iconColor: string;
  description: string;
  substeps: SubStep[];
}

const PHASES: Phase[] = [
  {
    id: 1,
    title: "1. Request & Connection",
    icon: MessageSquare,
    iconBg: "bg-blue-500/10 dark:bg-blue-500/15",
    iconColor: "text-blue-600 dark:text-blue-400 border-blue-500/20",
    description:
      "UI forwards prompt payload down to the local Rust core via Tauri IPC, which opens a secure HTTP event-stream connection.",
    substeps: [
      { label: "Submit Message", flow: "UI ➔ Core" },
      { label: "Open HTTPS SSE Channel", flow: "Core ➔ AI" },
    ],
  },
  {
    id: 2,
    title: "2. Streaming & Buffering",
    icon: Binary,
    iconBg: "bg-orange-500/10 dark:bg-orange-500/15",
    iconColor: "text-orange-600 dark:text-orange-400 border-orange-500/20",
    description:
      "AI provider streams event chunks. Rust core parses raw byte streams on background thread and flushes token buffers to UI.",
    substeps: [
      { label: "Stream Event Frames", flow: "AI ➔ Core" },
      { label: "Flush Token Buffer", flow: "Core ➔ UI" },
    ],
  },
  {
    id: 3,
    title: "3. Completion & Finalize",
    icon: CheckCircle,
    iconBg: "bg-purple-500/10 dark:bg-purple-500/15",
    iconColor: "text-purple-600 dark:text-purple-400 border-purple-500/20",
    description:
      "AI sends done event block. Rust readers close event socket connections and complete final React browser layout rendering.",
    substeps: [
      { label: "Receive [DONE] Signal", flow: "AI ➔ Core" },
      { label: "Complete Session Render", flow: "Core ➔ UI" },
    ],
  },
];

export default function StreamingFlowDiagram() {
  return (
    <div className="my-8 w-full rounded-2xl border border-border/40 bg-surface/20 dark:bg-black/15 backdrop-blur-md p-5 md:p-6 flex flex-col gap-6 shadow-lg overflow-hidden">
      {/* Main Grid: Explanation Boxes on Top (Desktop Layout) */}
      <div className="hidden md:grid grid-cols-3 gap-5 items-stretch">
        {PHASES.map((phase) => {
          const StepIcon = phase.icon;

          return (
            <div
              key={phase.id}
              className="p-5 rounded-xl border border-border/30 bg-surface/30 dark:bg-black/10 text-left flex flex-col justify-between"
              data-testid={`phase-card-${phase.id}`}
            >
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className={`p-1.5 rounded-lg ${phase.iconBg} ${phase.iconColor} border`}
                  >
                    <StepIcon size={16} />
                  </div>
                  <h4 className="text-xs md:text-sm font-bold text-text-primary">
                    {phase.title}
                  </h4>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  {phase.description}
                </p>
              </div>

              {/* Sub-steps nested list */}
              <div className="border-t border-border/20 pt-3 flex flex-col gap-2">
                {phase.substeps.map((sub, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-[10px]"
                  >
                    <span className="font-semibold text-text-primary">
                      {idx + 1}. {sub.label}
                    </span>
                    <span className="font-mono text-text-muted bg-hover px-1.5 py-0.5 rounded scale-90 origin-right">
                      {sub.flow}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connecting Wave SVG + Nodes Row (Desktop Layout) - Exactly as in the screenshot */}
      <div className="hidden md:block relative w-full h-[70px] bg-black/5 dark:bg-black/25 border border-border/15 rounded-xl">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Static connected wave line */}
          <path
            d="M 16.6% 35 C 27% 10, 39% 60, 50% 35 C 61% 10, 72% 60, 83.3% 35"
            fill="none"
            stroke="rgba(120, 120, 130, 0.2)"
            strokeWidth="3.5"
          />
        </svg>

        {/* Nodes Aligned to Columns - Unclickable and static */}
        <div className="absolute inset-0 flex justify-between px-[16.6%] items-center">
          {PHASES.map((phase) => (
            <div
              key={phase.id}
              className="w-9 h-9 rounded-full border border-border/40 bg-surface dark:bg-zinc-950 text-text-muted flex items-center justify-center relative z-10"
              data-testid={`phase-node-${phase.id}`}
            >
              <span className="text-xs font-extrabold">{phase.id}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile-Friendly Vertical Connected Timeline */}
      <div className="flex flex-col md:hidden py-1 gap-0">
        {PHASES.map((phase, index) => {
          const showLine = index < PHASES.length - 1;
          const StepIcon = phase.icon;

          return (
            <div key={phase.id} className="flex gap-4 min-h-[90px] relative">
              {/* Timeline Connector Track - Static */}
              <div className="flex flex-col items-center shrink-0 w-9">
                <div className="w-9 h-9 rounded-full border border-border/40 bg-surface dark:bg-zinc-900 text-text-muted flex items-center justify-center relative z-10">
                  <span className="text-xs font-bold">{phase.id}</span>
                </div>

                {/* Vertical Connectors on Mobile */}
                {showLine && (
                  <svg
                    className="w-[3px] grow my-1"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line
                      x1="50%"
                      y1="0"
                      x2="50%"
                      y2="100%"
                      stroke="rgba(120, 120, 130, 0.2)"
                      strokeWidth="3"
                    />
                  </svg>
                )}
              </div>

              {/* Phase Card Content */}
              <div className="grow pb-6">
                <div
                  className="p-4 rounded-xl border border-border/30 bg-surface/30 dark:bg-black/10 text-left"
                  data-testid={`phase-card-${phase.id}-mobile`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`p-1 rounded ${phase.iconBg} ${phase.iconColor} border`}
                    >
                      <StepIcon size={14} />
                    </div>
                    <h4 className="text-xs font-bold text-text-primary">
                      {phase.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
                    {phase.description}
                  </p>

                  {/* Sub-steps */}
                  <div className="border-t border-border/20 pt-2 flex flex-col gap-1.5">
                    {phase.substeps.map((sub, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-[9px] text-text-muted"
                      >
                        <span>
                          {idx + 1}. {sub.label}
                        </span>
                        <span className="font-mono bg-hover px-1 rounded">
                          {sub.flow}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
