"use client";

import { useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  Sparkles,
  Shield,
  Zap,
  Feather,
  Heart,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Multi-Provider Chat",
    description:
      "Connect to OpenAI, Anthropic, Google Gemini, Ollama, NVIDIA NIM, OpenRouter, or any OpenAI-compatible API.",
  },
  {
    icon: Sparkles,
    title: "Streaming Responses",
    description:
      "Real-time streaming with SSE — watch responses arrive token by token, just like the API intended.",
  },
  {
    icon: Shield,
    title: "Your Keys, Your Control",
    description:
      "API keys stay in your browser. No server-side storage, no third-party access. Ever.",
  },
  {
    icon: Zap,
    title: "Zero Config Servers",
    description:
      "Works with local models via Ollama out of the box. No sign-up, no cloud dependency.",
  },
  {
    icon: Feather,
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

function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
  visible,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  index: number;
  visible: boolean;
}) {
  const delay = `stagger-${Math.min(index + 1, 5)}` as
    | "stagger-1"
    | "stagger-2"
    | "stagger-3"
    | "stagger-4"
    | "stagger-5";

  return (
    <div
      className={`group glass-panel rounded-xl p-6 space-y-3 hover:border-accent/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5 animate-fade-in-up ${delay} ${visible ? "" : "opacity-0"}`}
    >
      <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon size={20} className="text-accent" />
      </div>
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default function Features() {
  const { ref, visible } = useInView();

  return (
    <section className="py-20 px-6">
      <div ref={ref} className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className={`text-3xl sm:text-4xl font-bold text-text-primary mb-3 animate-fade-in-up stagger-1 ${visible ? "" : "opacity-0"}`}
          >
            One interface, every provider
          </h2>
          <p
            className={`text-text-secondary max-w-xl mx-auto text-lg animate-fade-in-up stagger-2 ${visible ? "" : "opacity-0"}`}
          >
            Sythoria unifies your AI workflows under a single, privacy-first
            interface.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
