"use client";

import { Check, Info, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, type PointerEvent } from "react";
import { useScrollInView } from "@/hooks/useScrollInView";

interface ComparisonRow {
  feature: string;
  sythoriaText: string;
  boundary: string;
}

const comparisons: ComparisonRow[] = [
  {
    feature: "API key storage",
    sythoriaText: "Stored through the operating system keychain.",
    boundary:
      "The selected provider receives its key when Sythoria makes an authenticated request.",
  },
  {
    feature: "Prompt routing",
    sythoriaText:
      "The Rust backend connects directly to the endpoint configured for the selected model.",
    boundary:
      "Hosted providers process prompts under their own retention, billing, and privacy terms.",
  },
  {
    feature: "Sythoria account",
    sythoriaText: "No Sythoria account is required for the desktop client.",
    boundary:
      "Hosted model, search, and other external services can require their own accounts.",
  },
  {
    feature: "Local models",
    sythoriaText:
      "A loopback Ollama endpoint can provide a local model path after its model files are installed.",
    boundary:
      "Updates, hosted tools, cloud transcription, MCP, and remote artifacts can still use the network.",
  },
  {
    feature: "Conversation storage",
    sythoriaText:
      "Conversation snapshots and non-secret configuration use AES-256-GCM encrypted local files.",
    boundary:
      "Device access, backups, exports, and the operating system keychain remain part of the threat model.",
  },
  {
    feature: "Provider choice",
    sythoriaText:
      "Presets cover OpenAI, Anthropic, Gemini, Ollama, NVIDIA NIM, and OpenRouter, plus compatible endpoints.",
    boundary:
      "Model availability, context limits, pricing, and retention change independently at each provider.",
  },
  {
    feature: "Telemetry",
    sythoriaText:
      "The audited desktop version does not include a Sythoria analytics or hosted prompt service.",
    boundary:
      "Network integrations and providers may collect operational data; review their settings and policies.",
  },
  {
    feature: "Streaming",
    sythoriaText:
      "Sythoria displays provider response chunks as the backend receives them.",
    boundary:
      "Time to first token and throughput depend on the model, provider, network, and local device.",
  },
];

export default function Comparison() {
  const { ref: headingRef, visible: headingVisible } = useScrollInView();
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const bounds = card.getBoundingClientRect();
    card.style.setProperty(
      "--comparison-glow-x",
      `${event.clientX - bounds.left}px`
    );
    card.style.setProperty(
      "--comparison-glow-y",
      `${event.clientY - bounds.top}px`
    );
  };

  return (
    <section className="relative px-6 py-20">
      <div className="landing-section-divider mb-20" />

      <div ref={headingRef} className="mx-auto mb-14 max-w-2xl text-center">
        <div
          className={`scroll-animate scroll-fade-in-up stagger-1 ${headingVisible ? "in-view" : ""}`}
        >
          <span className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest text-accent">
            <Shield size={13} strokeWidth={1.5} aria-hidden="true" />
            Data boundaries
          </span>
        </div>
        <h2
          className={`scroll-animate scroll-fade-in-up stagger-2 mt-4 text-3xl font-bold tracking-[-0.035em] text-text-primary sm:text-4xl ${headingVisible ? "in-view" : ""}`}
        >
          Local control, documented limits.
        </h2>
        <p
          className={`scroll-animate scroll-fade-in-up stagger-3 mx-auto mt-3 max-w-lg text-base text-text-secondary ${headingVisible ? "in-view" : ""}`}
        >
          What Sythoria handles locally, and what remains the responsibility of
          the operating system or configured service.
        </p>
      </div>

      <motion.div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="bento-card group relative mx-auto max-w-5xl overflow-hidden rounded-[1.25rem]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-0 blur-3xl transition-opacity group-hover:opacity-[0.12]"
          style={{
            left: "var(--comparison-glow-x, 50%)",
            top: "var(--comparison-glow-y, 50%)",
          }}
        />

        <div
          className="content-scroll-region relative z-10 !m-0 rounded-[1.25rem]"
          role="region"
          aria-label="Sythoria data boundaries"
          tabIndex={0}
        >
          <table className="w-full min-w-[760px] border-collapse text-left">
            <caption className="sr-only">
              Sythoria version 0.4.2 storage and network boundaries
            </caption>
            <thead>
              <tr className="border-b border-border/30">
                <th
                  scope="col"
                  className="w-1/4 px-6 py-5 text-[11px] font-mono uppercase tracking-wider text-text-muted"
                >
                  Area
                </th>
                <th
                  scope="col"
                  className="w-5/12 border-x border-border/40 bg-accent-soft px-6 py-5 text-sm font-bold text-text-primary"
                >
                  Sythoria v0.4.2
                </th>
                <th
                  scope="col"
                  className="w-5/12 px-6 py-5 text-sm font-medium text-text-secondary"
                >
                  Boundary to understand
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {comparisons.map((row) => (
                <tr
                  key={row.feature}
                  className="transition-colors hover:bg-hover/20"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 text-sm font-semibold text-text-primary"
                  >
                    {row.feature}
                  </th>
                  <td className="border-x border-border/40 bg-accent-soft px-6 py-4 text-sm leading-relaxed text-text-primary">
                    <span className="flex items-start gap-2">
                      <Check
                        size={14}
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                      />
                      {row.sythoriaText}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm leading-relaxed text-text-secondary">
                    <span className="flex items-start gap-2">
                      <Info
                        size={14}
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-accent"
                      />
                      {row.boundary}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </section>
  );
}
