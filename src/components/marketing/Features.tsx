"use client";

import { MessageSquare, Sparkles, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Multi-Provider Chat",
    description: "Connect to OpenAI, Anthropic, Google Gemini, Ollama, NVIDIA NIM, OpenRouter, or any OpenAI-compatible API.",
  },
  {
    icon: Sparkles,
    title: "Streaming Responses",
    description: "Real-time streaming with SSE — watch responses arrive token by token, just like the API intended.",
  },
  {
    icon: Shield,
    title: "Your Keys, Your Control",
    description: "API keys stay in your browser. No server-side storage, no third-party access. Ever.",
  },
  {
    icon: Zap,
    title: "Zero Config Servers",
    description: "Works with local models via Ollama out of the box. No sign-up, no cloud dependency.",
  },
];

export default function Features() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-semibold text-text-primary mb-3">
            One interface, every provider
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Sythoria unifies your AI workflows under a single, privacy-first interface.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="glass-panel rounded-xl p-6 space-y-3 hover:border-accent/30 transition-colors duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center">
                <Icon size={20} className="text-accent" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">{title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
