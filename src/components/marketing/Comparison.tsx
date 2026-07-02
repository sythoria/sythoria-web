"use client";

import { Check, X, Shield } from "lucide-react";
import { useScrollInView } from "@/hooks/useScrollInView";

interface ComparisonRow {
  feature: string;
  sythoriaVal: boolean;
  sythoriaText: string;
  othersVal: boolean;
  othersText: string;
}

const comparisons: ComparisonRow[] = [
  {
    feature: "API Keys Storage",
    sythoriaVal: true,
    sythoriaText: "Stored locally on your device within secure OS Keychain",
    othersVal: false,
    othersText:
      "Uploaded to platform databases & decrypted on cloud proxy servers",
  },
  {
    feature: "Telemetry & Tracking",
    sythoriaVal: true,
    sythoriaText:
      "Zero Telemetry. Clean compilation with no PostHog or Segment hooks",
    othersVal: false,
    othersText:
      "Constant background interaction tracking and session cookie logging",
  },
  {
    feature: "Account Requirement",
    sythoriaVal: true,
    sythoriaText:
      "No Accounts. 1-click execution out of the box with zero signups",
    othersVal: false,
    othersText: "Mandatory web registration, email profiles, and passwords",
  },
  {
    feature: "Local Models (Ollama)",
    sythoriaVal: true,
    sythoriaText:
      "Offline Port. Direct loopback connection to local models via localhost",
    othersVal: false,
    othersText: "Locked out. Entirely dependent on external cloud API networks",
  },
  {
    feature: "Data Ownership",
    sythoriaVal: true,
    sythoriaText:
      "Local Database. Stored in client state with 1-click Markdown export",
    othersVal: false,
    othersText:
      "Platform Custody. Stored on their databases, potentially trained on",
  },
  {
    feature: "Multi-Provider Support",
    sythoriaVal: true,
    sythoriaText:
      "Select and switch between OpenAI, Anthropic, Gemini, DeepSeek instantly",
    othersVal: false,
    othersText:
      "Locked vendor stacks. Subscription walls isolate different providers",
  },
  {
    feature: "Pricing Model",
    sythoriaVal: true,
    sythoriaText:
      "Free & Open Source. Pay-as-you-go API consumption with 0% markups",
    othersVal: false,
    othersText:
      "$20/month flat fee per provider, regardless of actual message usage",
  },
  {
    feature: "Response Streaming",
    sythoriaVal: true,
    sythoriaText:
      "Yes. Real-time Server-Sent Events (SSE) stream token-by-token",
    othersVal: true,
    othersText: "Yes. Standard cloud streaming supported",
  },
  {
    feature: "Markdown Rendering",
    sythoriaVal: true,
    sythoriaText:
      "Yes. Full LaTeX mathematical, code blocks, and table rendering",
    othersVal: true,
    othersText: "Yes. Standard markdown formatting supported",
  },
];

export default function Comparison() {
  const { ref: headingRef, visible: headingVisible } = useScrollInView();

  return (
    <section className="py-20 px-6 relative">
      <div className="landing-section-divider mb-20" />

      {/* Heading */}
      <div ref={headingRef} className="max-w-2xl mx-auto text-center mb-14">
        <div
          className={`scroll-animate scroll-fade-in-up stagger-1 ${headingVisible ? "in-view" : ""}`}
        >
          <span className="text-xs font-medium uppercase tracking-widest text-accent flex items-center justify-center gap-2">
            <Shield size={13} strokeWidth={1.5} />
            Why Sythoria
          </span>
        </div>
        <h2
          className={`mt-4 text-3xl sm:text-4xl font-bold text-text-primary tracking-[-0.035em] scroll-animate scroll-fade-in-up stagger-2 ${headingVisible ? "in-view" : ""}`}
        >
          Privacy isn&apos;t a feature.
          <br className="hidden sm:block" />
          It&apos;s the default.
        </h2>
        <p
          className={`mt-3 text-text-secondary max-w-lg mx-auto text-base scroll-animate scroll-fade-in-up stagger-3 ${headingVisible ? "in-view" : ""}`}
        >
          Unlike other AI chat interfaces, Sythoria never compromises your data.
        </p>
      </div>

      {/* Premium Table Container */}
      <div className="max-w-5xl mx-auto rounded-2xl border border-border/60 bg-landing-card backdrop-blur-md shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[700px]">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-border/30">
                <th className="py-5 px-6 text-[10px] font-mono uppercase tracking-wider text-text-muted w-1/4">
                  Feature / Spec
                </th>
                <th className="py-5 px-6 bg-accent-soft border-x border-border/40 text-xs sm:text-sm font-bold text-text-primary w-5/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Sythoria Desktop Client</span>
                  </div>
                </th>
                <th className="py-5 px-6 text-xs sm:text-sm font-medium text-text-secondary w-5/12">
                  Traditional SaaS Clients
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-border/40">
              {comparisons.map((row) => (
                <tr
                  key={row.feature}
                  className="hover:bg-hover/20 dark:hover:bg-white/[0.01] transition-colors duration-200"
                >
                  {/* Feature Title */}
                  <td className="py-4.5 px-6 text-xs sm:text-sm font-semibold text-text-primary tracking-wide">
                    {row.feature}
                  </td>

                  {/* Sythoria Spec (Highlighted Column) */}
                  <td className="py-4.5 px-6 bg-accent-soft border-x border-border/40 text-xs sm:text-sm text-text-primary font-medium leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="p-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span>{row.sythoriaText}</span>
                    </div>
                  </td>

                  {/* Competitor Spec */}
                  <td className="py-4.5 px-6 text-xs sm:text-sm text-text-secondary font-light leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span
                        className={`p-0.5 rounded mt-0.5 shrink-0 ${
                          row.othersVal
                            ? "bg-emerald-500/5 border border-emerald-500/10 text-emerald-600/70 dark:text-emerald-400/70"
                            : "bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {row.othersVal ? (
                          <Check size={12} strokeWidth={2.5} />
                        ) : (
                          <X size={12} strokeWidth={2.5} />
                        )}
                      </span>
                      <span>{row.othersText}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
