"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  MessageSquare,
  Sparkles,
  Shield,
  Zap,
  Feather,
  Heart,
} from "lucide-react";
import { Card } from "@/components/ui";

const features = [
  {
    icon: MessageSquare,
    title: "Multi-Provider Chat",
    description:
      "Connect to OpenAI, Anthropic, Google Gemini, Ollama, NVIDIA NIM, OpenRouter, or any OpenAI-compatible API.",
    accent: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Sparkles,
    title: "Streaming Responses",
    description:
      "Real-time streaming with SSE — watch responses arrive token by token, just like the API intended.",
    accent: "from-amber-500 to-orange-500",
  },
  {
    icon: Shield,
    title: "Your Keys, Your Control",
    description:
      "API keys stay in your browser. No server-side storage, no third-party access. Ever.",
    accent: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Zap,
    title: "Zero Config Servers",
    description:
      "Works with local models via Ollama out of the box. No sign-up, no cloud dependency.",
    accent: "from-blue-500 to-blue-600",
  },
  {
    icon: Feather,
    title: "Lightweight",
    description:
      "Minimal footprint, instant load. No Electron, no heavy frameworks — just a lean web app that runs anywhere.",
    accent: "from-pink-500 to-rose-500",
  },
  {
    icon: Heart,
    title: "Free & Open Source",
    description:
      "No subscriptions, no paywalls, no feature gates. Fully open source under a permissive license.",
    accent: "from-violet-500 to-purple-600",
  },
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
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  accent,
  index,
  visible,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  accent: string;
  index: number;
  visible: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const delay = `stagger-${Math.min(index + 1, 5)}` as
    | "stagger-1"
    | "stagger-2"
    | "stagger-3"
    | "stagger-4"
    | "stagger-5";

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
        handleMove as unknown as EventListener,
      );
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`preserve-3d transition-transform duration-500 ease-out animate-fade-in-up ${delay} ${visible ? "" : "opacity-0"}`}
    >
      <Card variant="glass" padding="none" hover className="h-full group">
        <div className="p-6 space-y-4 flex flex-col h-full">
          <div className="flex items-start justify-between">
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center shadow-lg shadow-black/5`}
            >
              <Icon size={20} className="text-white" />
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
  const { ref, visible } = useInView();

  return (
    <section className="py-24 px-6 relative">
      <div className="landing-section-divider mb-24" />
      <div ref={ref} className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div
            className={`animate-fade-in-up stagger-1 ${visible ? "" : "opacity-0"}`}
          >
            <span className="text-xs font-medium uppercase tracking-widest text-accent">
              Features
            </span>
          </div>
          <h2
            className={`mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold text-text-primary tracking-[-0.03em] animate-fade-in-up stagger-2 ${visible ? "" : "opacity-0"}`}
          >
            One interface, every provider
          </h2>
          <p
            className={`mt-4 text-text-secondary max-w-xl mx-auto text-lg leading-[1.65] font-light tracking-[-0.01em] animate-fade-in-up stagger-3 ${visible ? "" : "opacity-0"}`}
          >
            Sythoria unifies your AI workflows under a single, privacy-first
            interface.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          {features.map(({ icon, title, description, accent }, i) => (
            <FeatureCard
              key={title}
              icon={icon}
              title={title}
              description={description}
              accent={accent}
              index={i}
              visible={visible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
