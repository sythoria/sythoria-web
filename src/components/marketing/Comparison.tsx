"use client";

import { Columns3 } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, type PointerEvent } from "react";
import { useScrollInView } from "@/hooks/useScrollInView";

interface ComparisonRow {
  feature: string;
  sythoria: string;
  otherChatbots: string;
}

const comparisons: ComparisonRow[] = [
  {
    feature: "App format",
    sythoria:
      "Native Tauri desktop app for Windows x64, Apple silicon macOS, and Linux x86_64.",
    otherChatbots:
      "Many are hosted services or self-hosted web apps. Installation and hosting requirements vary by product.",
  },
  {
    feature: "User accounts",
    sythoria: "No Sythoria account or local login screen.",
    otherChatbots:
      "Hosted and multi-user products commonly require an account. Some self-hosted tools can run locally or limit registration.",
  },
  {
    feature: "Model providers",
    sythoria:
      "Presets for OpenAI, Anthropic, Gemini, Ollama, NVIDIA NIM, and OpenRouter, plus editable OpenAI-compatible endpoints.",
    otherChatbots:
      "Provider support varies. Some focus on one ecosystem, while others support several providers and compatible endpoints.",
  },
  {
    feature: "Local project work",
    sythoria:
      "Scoped project folders with Read, Write, or Full access. Writes use an isolated Git worktree with Review, Apply, and Discard.",
    otherChatbots:
      "File uploads and tool integrations are common. Repository access and review workflows depend on the product and its configuration.",
  },
  {
    feature: "Web access",
    sythoria:
      "Google, SearXNG, or Firecrawl search; Firecrawl or Jina Reader page fetching.",
    otherChatbots:
      "Search and page reading may be built in, supplied by an external tool, or unavailable until configured.",
  },
  {
    feature: "MCP transports",
    sythoria:
      "stdio, SSE, and Streamable HTTP, with single-use approval for each call from an untrusted server.",
    otherChatbots:
      "MCP support varies by product, transport, and version. Some products rely on bridges or separately configured tool servers.",
  },
  {
    feature: "Application data",
    sythoria:
      "Conversation snapshots and settings use encrypted local files; the root key is stored in the operating system credential vault.",
    otherChatbots:
      "Hosted products keep application data on their systems. With self-hosted tools, storage, backups, and access controls are usually managed by the operator.",
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
            <Columns3 size={13} strokeWidth={1.5} aria-hidden="true" />
            Comparison
          </span>
        </div>
        <h2
          className={`scroll-animate scroll-fade-in-up stagger-2 mt-4 text-3xl font-bold tracking-[-0.035em] text-text-primary sm:text-4xl ${headingVisible ? "in-view" : ""}`}
        >
          How Sythoria compares
        </h2>
        <p
          className={`scroll-animate scroll-fade-in-up stagger-3 mx-auto mt-3 max-w-lg text-base text-text-secondary ${headingVisible ? "in-view" : ""}`}
        >
          A practical look at Sythoria alongside common hosted and self-hosted
          AI chat interfaces.
        </p>
      </div>

      <motion.div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="bento-card group relative mx-auto max-w-6xl overflow-hidden rounded-[1.25rem]"
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
          aria-label="Sythoria and other AI chatbots comparison"
          tabIndex={0}
        >
          <table className="w-full min-w-[760px] border-collapse text-left">
            <caption className="sr-only">
              Feature comparison between Sythoria version 0.4.4 and other AI
              chatbots
            </caption>
            <thead>
              <tr className="border-b border-border/30">
                <th
                  scope="col"
                  className="w-[20%] px-6 py-5 text-[11px] font-mono uppercase tracking-wider text-text-muted"
                >
                  Feature
                </th>
                <th
                  scope="col"
                  className="w-[40%] border-x border-border/40 bg-accent-soft px-6 py-5 text-sm font-bold text-text-primary"
                >
                  Sythoria v0.4.4
                </th>
                <th
                  scope="col"
                  className="w-[40%] px-6 py-5 text-sm font-medium text-text-secondary"
                >
                  Other AI chatbots
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
                    {row.sythoria}
                  </td>
                  <td className="px-6 py-4 text-sm leading-relaxed text-text-secondary">
                    {row.otherChatbots}
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
