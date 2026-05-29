"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import {
  MessagesSquare,
  Activity,
  ShieldCheck,
  Server,
  Minimize2,
  Heart,
} from "lucide-react";
import { Card } from "@/components/ui";
import { useScrollInView } from "@/hooks/useScrollInView";

const features = [
  {
    icon: MessagesSquare,
    title: "Multi-Provider Chat",
    description:
      "Connect to OpenAI, Anthropic, Google Gemini, Ollama, NVIDIA NIM, OpenRouter, or any OpenAI-compatible API.",
  },
  {
    icon: Activity,
    title: "Streaming Responses",
    description:
      "Real-time streaming with SSE — watch responses arrive token by token, just like the API intended.",
  },
  {
    icon: ShieldCheck,
    title: "Your Keys, Your Control",
    description:
      "API keys stay in your browser. No server-side storage, no third-party access. Ever.",
  },
  {
    icon: Server,
    title: "Zero Config Servers",
    description:
      "Works with local models via Ollama out of the box. No sign-up, no cloud dependency.",
  },
  {
    icon: Minimize2,
    title: "Lightweight",
    description:
      "Minimal footprint, instant load. No Electron, no heavy frameworks — just a lean web app that runs anywhere.",
  },
  {
    icon: Heart,
    title: "Free & Open Source",
    description:
      "No subscriptions, no paywalls, no feature gates. Fully open source under a permissive license.",
  },
];

function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
  visible,
}: {
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    strokeWidth?: number;
  }>;
  title: string;
  description: string;
  index: number;
  visible: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const staggerClass = `stagger-${Math.min(index + 1, 6)}` as
    | "stagger-1"
    | "stagger-2"
    | "stagger-3"
    | "stagger-4"
    | "stagger-5"
    | "stagger-6";

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const handleMove = (e: MouseEvent<HTMLDivElement>) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) scale(1.02)`;
    };

    const handleLeave = () => {
      el.style.transform =
        "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
    };

    el.addEventListener("mousemove", handleMove as unknown as EventListener);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener(
        "mousemove",
        handleMove as unknown as EventListener
      );
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`preserve-3d transition-transform duration-500 ease-out scroll-animate scroll-fade-in-up ${staggerClass} ${visible ? "in-view" : ""}`}
    >
      <Card variant="glass" padding="none" hover className="h-full group">
        <div className="p-6 space-y-4 flex flex-col h-full">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-lg bg-accent-soft/60 border border-accent/10 flex items-center justify-center">
              <Icon size={18} className="text-accent" strokeWidth={1.5} />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-text-primary mb-1.5">
              {title}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function Features() {
  const { ref, visible } = useScrollInView();

  return (
    <section id="features" className="py-24 px-6 relative">
      <div className="landing-section-divider mb-24" />
      <div ref={ref} className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div
            className={`scroll-animate scroll-fade-in-up stagger-1 ${visible ? "in-view" : ""}`}
          >
            <span className="text-xs font-medium uppercase tracking-widest text-accent">
              Features
            </span>
          </div>
          <h2
            className={`mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold text-text-primary tracking-[-0.03em] scroll-animate scroll-fade-in-up stagger-2 ${visible ? "in-view" : ""}`}
          >
            One interface, every provider
          </h2>
          <p
            className={`mt-4 text-text-secondary max-w-xl mx-auto text-lg leading-[1.65] font-light tracking-[-0.01em] scroll-animate scroll-fade-in-up stagger-3 ${visible ? "in-view" : ""}`}
          >
            Sythoria unifies your AI workflows under a single, privacy-first
            interface.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          {features.map(({ icon, title, description }, i) => (
            <FeatureCard
              key={title}
              icon={icon}
              title={title}
              description={description}
              index={i}
              visible={visible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
