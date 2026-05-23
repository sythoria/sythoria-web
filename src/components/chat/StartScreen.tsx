"use client";

import { Bot, Play } from "lucide-react";

interface StartScreenProps {
  onStart: () => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-chat/80 backdrop-blur-sm p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-accent/3 blur-3xl" />
      </div>

      <div className="glass-panel w-full max-w-md rounded-2xl p-8 animate-slide-up shadow-2xl relative text-center">
        <div className="w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
          <Bot size={40} className="text-accent" />
        </div>
        <h1 className="text-4xl font-bold text-text-primary mb-4">Sythoria</h1>
        <p className="text-text-muted mb-8">Welcome to Sythoria. Ready to get started?</p>

        <button
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium transition-all shadow-lg shadow-accent/20 text-lg"
        >
          <Play size={20} />
          Start
        </button>
      </div>
    </div>
  );
}
