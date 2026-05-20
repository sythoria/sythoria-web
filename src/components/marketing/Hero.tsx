import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-32 pb-16 px-6 text-center">
      <div className="max-w-3xl mx-auto animate-slide-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft border border-accent/20 text-accent text-xs font-medium mb-8">
          Privacy-first AI chat
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary leading-tight tracking-tight mb-6">
          Your keys. Your models.
          <br />
          <span className="text-accent">Your conversation.</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-xl mx-auto mb-10 leading-relaxed">
          Sythoria is a unified chat interface for OpenAI, Anthropic, Gemini, Ollama, and any OpenAI-compatible
          API. No accounts. No tracking. Just chat.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-base font-medium transition-colors min-h-[48px]"
          >
            Try it out
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-hover text-base font-medium transition-colors min-h-[48px]"
          >
            Configure models
          </Link>
        </div>
      </div>
    </section>
  );
}
