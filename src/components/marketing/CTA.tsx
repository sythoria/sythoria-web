"use client";

import { useMemo } from "react";
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

// Seeded pseudo-random for deterministic particle positions
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function CTA() {
  const { ref, visible } = useScrollInView();

  const particles = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: `${seededRandom(i * 7 + 1) * 100}%`,
      top: `${seededRandom(i * 13 + 3) * 100}%`,
      duration: `${6 + seededRandom(i * 11 + 5) * 6}s`,
      delay: `${seededRandom(i * 17 + 9) * 5}s`,
    }));
  }, []);

  return (
    <section className="relative py-32 px-6 overflow-hidden cta-gradient-bg">
      {/* Floating particles — suppressHydrationWarning handles minor
          floating-point string differences between SSR and client */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          suppressHydrationWarning
          style={
            {
              left: p.left,
              top: p.top,
              "--particle-duration": p.duration,
              "--particle-delay": p.delay,
            } as React.CSSProperties
          }
        />
      ))}

      <div ref={ref} className="relative z-10 max-w-3xl mx-auto text-center">
        <h2
          className={`text-4xl sm:text-6xl font-bold tracking-[-0.04em] text-text-primary scroll-animate scroll-fade-in-up stagger-1 ${visible ? "in-view" : ""}`}
        >
          Start now.
        </h2>

        <p
          className={`mt-6 text-text-secondary text-lg sm:text-xl max-w-xl mx-auto leading-relaxed scroll-animate scroll-fade-in-up stagger-2 ${visible ? "in-view" : ""}`}
        >
          No sign-up, no subscription, no tracking. Just bring your API key and
          go.
        </p>

        <div
          className={`mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 scroll-animate scroll-fade-in-up stagger-3 ${visible ? "in-view" : ""}`}
        >
          <Button
            variant="primary"
            size="xl"
            href="https://github.com/sythoria/sythoria-desktop/releases/latest"
            iconRight={<ArrowRight size={18} strokeWidth={1.5} />}
          >
            Download Desktop App
          </Button>
        </div>

        <div
          className={`mt-6 scroll-animate scroll-fade-in-up stagger-4 ${visible ? "in-view" : ""}`}
        >
          <a
            href="https://github.com/sythoria/sythoria-desktop"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors duration-300"
          >
            <GithubIcon size={16} />
            <span>Star on GitHub</span>
          </a>
        </div>
      </div>
    </section>
  );
}
