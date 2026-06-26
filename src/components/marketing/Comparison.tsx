"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X, Shield } from "lucide-react";
import { useScrollInView } from "@/hooks/useScrollInView";

const comparisons = [
  { feature: "Open source", us: true, them: false },
  { feature: "No account required", us: true, them: false },
  { feature: "API keys stay local", us: true, them: false },
  { feature: "Multi-provider support", us: true, them: false },
  { feature: "Local model support (Ollama)", us: true, them: false },
  { feature: "Zero telemetry", us: true, them: false },
  { feature: "No subscription", us: true, them: false },
  { feature: "Streaming responses", us: true, them: true },
  { feature: "Markdown rendering", us: true, them: true },
];

const sythoriaScore = comparisons.filter((c) => c.us).length;
const othersScore = comparisons.filter((c) => c.them).length;

export default function Comparison() {
  const { ref: headingRef, visible: headingVisible } = useScrollInView();
  const rowsRef = useRef<HTMLDivElement>(null);
  const [rowsRevealed, setRowsRevealed] = useState(false);

  useEffect(() => {
    const el = rowsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRowsRevealed(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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

      {/* Comparison container */}
      <div
        ref={rowsRef}
        className="max-w-2xl mx-auto rounded-2xl border border-border/50 bg-landing-card overflow-hidden"
      >
        {/* Table header */}
        <div className="flex items-center border-b border-border/30 px-5 py-3">
          <div className="flex-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
              Feature
            </span>
          </div>
          <div className="w-24 sm:w-28 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-primary">
              Sythoria
            </span>
          </div>
          <div className="w-24 sm:w-28 text-center">
            <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
              Others
            </span>
          </div>
        </div>

        {/* Comparison rows */}
        {comparisons.map(({ feature, us, them }, i) => (
          <div
            key={feature}
            className={`comparison-row ${rowsRevealed ? "revealed" : ""} flex items-center px-5 py-3.5 border-b border-border/20 last:border-b-0`}
            style={{ transitionDelay: `${i * 0.07}s` }}
          >
            <div className="flex-1 text-sm text-text-primary font-medium">
              {feature}
            </div>
            <div className="w-24 sm:w-28 flex justify-center">
              <span
                className={`comparison-check ${us ? "comparison-check-yes" : "comparison-check-no"}`}
              >
                {us ? (
                  <Check size={14} strokeWidth={2.5} />
                ) : (
                  <X size={14} strokeWidth={2} />
                )}
              </span>
            </div>
            <div className="w-24 sm:w-28 flex justify-center">
              <span
                className={`comparison-check ${them ? "comparison-check-yes" : "comparison-check-no"}`}
              >
                {them ? (
                  <Check size={14} strokeWidth={2.5} />
                ) : (
                  <X size={14} strokeWidth={2} />
                )}
              </span>
            </div>
          </div>
        ))}

        {/* Privacy Score */}
        <div className="border-t border-border/30 px-5 py-5">
          <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted mb-4">
            Privacy Score
          </p>
          <div className="space-y-3">
            {/* Sythoria score */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-text-primary w-20 shrink-0">
                Sythoria
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-border/30 overflow-hidden">
                {rowsRevealed && (
                  <div
                    className="score-bar"
                    style={{ "--score-scale": "1" } as React.CSSProperties}
                  />
                )}
              </div>
              <span className="text-xs font-mono text-accent font-bold w-8 text-right">
                {sythoriaScore}/{comparisons.length}
              </span>
            </div>
            {/* Others score */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-text-muted w-20 shrink-0">
                Others
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-border/30 overflow-hidden">
                {rowsRevealed && (
                  <div
                    className="score-bar"
                    style={{ "--score-scale": "0.22" } as React.CSSProperties}
                  />
                )}
              </div>
              <span className="text-xs font-mono text-text-muted w-8 text-right">
                {othersScore}/{comparisons.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
