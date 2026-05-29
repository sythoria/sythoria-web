"use client";

import { Fragment } from "react";
import { Check, X } from "lucide-react";
import { Card } from "@/components/ui";
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

export default function Comparison() {
  const { ref, visible } = useScrollInView();

  return (
    <section className="py-24 px-6 relative">
      <div className="landing-section-divider mb-24" />
      <div ref={ref} className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <div
            className={`scroll-animate scroll-fade-in-up stagger-1 ${visible ? "in-view" : ""}`}
          >
            <span className="text-xs font-medium uppercase tracking-widest text-accent">
              Why Sythoria
            </span>
          </div>
          <h2
            className={`mt-4 text-3xl sm:text-4xl font-bold text-text-primary tracking-tight scroll-animate scroll-fade-in-up stagger-2 ${visible ? "in-view" : ""}`}
          >
            Privacy isn&apos;t a feature. It&apos;s the default.
          </h2>
          <p
            className={`mt-4 text-text-secondary max-w-lg mx-auto text-lg scroll-animate scroll-fade-in-up stagger-3 ${visible ? "in-view" : ""}`}
          >
            Unlike other AI chat interfaces, Sythoria never compromises your
            data.
          </p>
        </div>

        <Card
          variant="glass"
          padding="none"
          className={`overflow-hidden scroll-animate scroll-fade-in-up stagger-4 ${visible ? "in-view" : ""} transition-all duration-500`}
        >
          <div className="grid grid-cols-[1fr_auto_auto] gap-0">
            <div className="px-6 py-4 border-b border-border/30">
              <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                Feature
              </span>
            </div>
            <div className="px-8 py-4 border-b border-border/30 bg-accent-soft/20">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Sythoria
              </span>
            </div>
            <div className="px-8 py-4 border-b border-border/30">
              <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                Others
              </span>
            </div>

            {comparisons.map(({ feature, us, them }) => (
              <Fragment key={feature}>
                <div className="px-6 py-3.5 border-b border-border/20 text-sm text-text-primary">
                  {feature}
                </div>
                <div className="px-8 py-3.5 border-b border-border/20 bg-accent-soft/10 text-center">
                  {us ? (
                    <Check
                      size={16}
                      className="text-accent mx-auto"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <X
                      size={16}
                      className="text-text-muted mx-auto"
                      strokeWidth={1.5}
                    />
                  )}
                </div>
                <div className="px-8 py-3.5 border-b border-border/20 text-center">
                  {them ? (
                    <Check
                      size={16}
                      className="text-text-muted mx-auto"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <X
                      size={16}
                      className="text-text-muted/40 mx-auto opacity-30"
                      strokeWidth={1.5}
                    />
                  )}
                </div>
              </Fragment>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
