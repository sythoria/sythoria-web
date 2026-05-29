"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { useScrollInView } from "@/hooks/useScrollInView";

function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export default function CTA() {
  const { ref, visible } = useScrollInView();

  return (
    <section className="py-24 px-6 relative">
      <div className="landing-section-divider mb-24" />
      <div ref={ref} className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

          <div className="relative glass-panel rounded-3xl p-10 sm:p-16 text-center">
            <div
              className={`scroll-animate scroll-fade-in-up stagger-1 ${visible ? "in-view" : ""}`}
            >
              <span className="text-xs font-medium uppercase tracking-widest text-accent">
                Get started
              </span>
            </div>

            <h2
              className={`mt-6 text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary tracking-tight scroll-animate scroll-fade-in-up stagger-2 ${visible ? "in-view" : ""}`}
            >
              Start chatting in{" "}
              <span className="landing-gradient-text">seconds</span>
            </h2>

            <p
              className={`mt-5 text-text-secondary max-w-lg mx-auto text-lg leading-relaxed scroll-animate scroll-fade-in-up stagger-3 ${visible ? "in-view" : ""}`}
            >
              No sign-up, no subscription, no tracking. Just bring your API key
              and go.
            </p>

            <div
              className={`mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 scroll-animate scroll-fade-in-up stagger-4 ${visible ? "in-view" : ""}`}
            >
              <Button
                variant="primary"
                size="lg"
                href="/chat"
                iconRight={<ArrowRight size={18} strokeWidth={1.5} />}
              >
                Open Sythoria
              </Button>
              <Button
                variant="secondary"
                size="lg"
                href="https://github.com/sythoria/sythoria-desktop"
                icon={<GithubIcon size={18} />}
              >
                Star on GitHub
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
