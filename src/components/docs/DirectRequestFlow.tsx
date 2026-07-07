"use client";

import React from "react";
import { Laptop, Key, Server } from "lucide-react";

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
    title: "1. Local App Core",
    icon: Laptop,
    iconBg: "bg-blue-500/10 dark:bg-blue-500/15",
    iconColor: "text-blue-600 dark:text-blue-400 border-blue-500/20",
    description: "Sythoria desktop client runs entirely on your local machine.",
    flowDetails: "Queries keys securely when needed",
  },
  {
    id: 2,
    title: "2. Secure Keychain",
    icon: Key,
    iconBg: "bg-green-500/10 dark:bg-green-500/15",
    iconColor: "text-green-600 dark:text-green-400 border-green-500/20",
    description:
      "OS Credential Store vault (macOS Keychain, Windows Credential Manager, Linux Keyring).",
    flowDetails: "Loads key into RAM; never logs to disk",
  },
  {
    id: 3,
    title: "3. Direct AI Provider",
    icon: Server,
    iconBg: "bg-purple-500/10 dark:bg-purple-500/15",
    iconColor: "text-purple-600 dark:text-purple-400 border-purple-500/20",
    description: "Establishes secure, direct HTTPS channel to provider server.",
    flowDetails: "No proxy or middleman interception",
  },
];

export default function DirectRequestFlow() {
  return (
    <div className="my-8 w-full rounded-2xl border border-border/40 bg-surface/20 dark:bg-black/15 backdrop-blur-md p-5 md:p-6 flex flex-col gap-6 select-none shadow-lg overflow-hidden">
      <style>{`
        @keyframes directFlow {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        .flow-line-direct {
          stroke: var(--theme-accent, #9aa8d6);
          stroke-dasharray: 6 3;
          animation: directFlow 1.6s infinite linear;
          filter: drop-shadow(0 0 2px var(--theme-accent, #9aa8d6));
        }
      `}</style>

      {/* Grid layout of columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
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

      {/* SVG Connecting Flow Lines (Desktop Only) */}
      <div className="hidden md:block relative w-full h-[70px] bg-black/5 dark:bg-black/25 border border-border/15 rounded-xl">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Curve 1: App to Keyring request / return */}
          <path
            d="M 16.6% 35 C 27% 10, 39% 60, 50% 35"
            fill="none"
            stroke="rgba(120, 120, 130, 0.2)"
            strokeWidth="3.5"
            className="flow-line-direct"
          />
          {/* Curve 2: App to AI Provider direct HTTPS channel */}
          <path
            d="M 50% 35 C 61% 10, 72% 60, 83.3% 35"
            fill="none"
            stroke="rgba(120, 120, 130, 0.2)"
            strokeWidth="3.5"
            className="flow-line-direct"
          />
        </svg>

        {/* Indicators */}
        <div className="absolute inset-0 flex justify-between px-[16.6%] items-center">
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
