"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { Card } from "@/components/ui";

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

function useInView(threshold = 0.1) {
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

export default function Comparison() {
  const { ref, visible } = useInView();

  return (
    <section className="py-24 px-6 relative">
      <div className="landing-section-divider mb-24" />
      <div ref={ref} className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <div className={`animate-fade-in-up stagger-1 ${visible ? "" : "opacity-0"}`}>
            <span className="text-xs font-medium uppercase tracking-widest text-accent">Why Sythoria</span>
          </div>
          <h2 className={`mt-4 text-3xl sm:text-4xl font-bold text-text-primary tracking-tight animate-fade-in-up stagger-2 ${visible ? "" : "opacity-0"}`}>
            Privacy isn&apos;t a feature. It&apos;s the default.
          </h2>
          <p className={`mt-4 text-text-secondary max-w-lg mx-auto text-lg animate-fade-in-up stagger-3 ${visible ? "" : "opacity-0"}`}>
            Unlike other AI chat interfaces, Sythoria never compromises your data.
          </p>
        </div>

        <Card variant="glass" padding="none" className={`overflow-hidden animate-fade-in-up stagger-4 ${visible ? "" : "opacity-0"} transition-all duration-500`}>
          <div className="grid grid-cols-[1fr_auto_auto] gap-0">
            <div className="px-6 py-4 border-b border-border/30">
              <span className="text-xs font-medium uppercase tracking-wider text-text-muted">Feature</span>
            </div>
            <div className="px-8 py-4 border-b border-border/30 bg-accent-soft/20">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">Sythoria</span>
            </div>
            <div className="px-8 py-4 border-b border-border/30">
              <span className="text-xs font-medium uppercase tracking-wider text-text-muted">Others</span>
            </div>

{comparisons.map(({ feature, us, them }) => (
          <Fragment key={feature}>
            <div className="px-6 py-3.5 border-b border-border/20 text-sm text-text-primary">
              {feature}
            </div>
            <div className="px-8 py-3.5 border-b border-border/20 bg-accent-soft/10 text-center">
              {us ? (
                <Check size={16} className="text-accent mx-auto" />
              ) : (
                <X size={16} className="text-text-muted mx-auto" />
              )}
            </div>
            <div className="px-8 py-3.5 border-b border-border/20 text-center">
              {them ? (
                <Check size={16} className="text-text-muted mx-auto" />
              ) : (
                <X size={16} className="text-text-muted/40 mx-auto opacity-30" />
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
