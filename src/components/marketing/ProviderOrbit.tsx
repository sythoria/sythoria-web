"use client";

import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

/* ── Provider data ────────────────────────────────── */

interface Provider {
  name: string;
  initial: string;
  accentBg: string;
  accentBorder: string;
}

const innerProviders: Provider[] = [
  {
    name: "OpenAI",
    initial: "O",
    accentBg: "rgba(16,163,127,0.12)",
    accentBorder: "rgba(16,163,127,0.35)",
  },
  {
    name: "Anthropic",
    initial: "A",
    accentBg: "rgba(204,115,60,0.12)",
    accentBorder: "rgba(204,115,60,0.35)",
  },
  {
    name: "Gemini",
    initial: "G",
    accentBg: "rgba(66,133,244,0.12)",
    accentBorder: "rgba(66,133,244,0.35)",
  },
];

const outerProviders: Provider[] = [
  {
    name: "Ollama",
    initial: "O",
    accentBg: "rgba(255,255,255,0.06)",
    accentBorder: "rgba(255,255,255,0.18)",
  },
  {
    name: "OpenRouter",
    initial: "R",
    accentBg: "rgba(147,51,234,0.12)",
    accentBorder: "rgba(147,51,234,0.35)",
  },
  {
    name: "NVIDIA",
    initial: "N",
    accentBg: "rgba(118,185,0,0.12)",
    accentBorder: "rgba(118,185,0,0.35)",
  },
];

/* ── Orbit configuration ──────────────────────────── */

const INNER_RADIUS = 100; // px from center
const OUTER_RADIUS = 155; // px from center
const INNER_DURATION = 20; // seconds, clockwise
const OUTER_DURATION = 30; // seconds, counter-clockwise

/* ── Component ────────────────────────────────────── */

export default function ProviderOrbit() {
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const activeReduceMotion = mounted ? !!shouldReduceMotion : false;

  return (
    <div
      className="relative mx-auto"
      style={{ width: 350, height: 350 }}
      aria-label="AI providers orbiting Sythoria"
      role="img"
    >
      {/* ── Inner orbit ring ─────────────────────── */}
      <div
        className="orbit-ring"
        style={{ width: INNER_RADIUS * 2, height: INNER_RADIUS * 2 }}
      />

      {/* ── Outer orbit ring ─────────────────────── */}
      <div
        className="orbit-ring"
        style={{ width: OUTER_RADIUS * 2, height: OUTER_RADIUS * 2 }}
      />

      {/* ── Center glow ──────────────────────────── */}
      <div
        className="orbit-center-glow"
        style={activeReduceMotion ? { animation: "none" } : undefined}
      />

      {/* ── Center logo ──────────────────────────── */}
      <div
        className="absolute top-1/2 left-1/2 z-10 flex items-center justify-center rounded-full border border-white/10 bg-white shadow-lg dark:bg-[#0c0c1a]"
        style={{
          width: 56,
          height: 56,
          transform: "translate(-50%, -50%)",
        }}
      >
        <Image
          src="/logonobg.png"
          alt="Sythoria"
          width={36}
          height={36}
          className="rounded-full"
        />
      </div>

      {/* ── Inner orbit items (clockwise, 20s) ──── */}
      {innerProviders.map((provider, i) => {
        const staticAngle = (360 / innerProviders.length) * i;

        return (
          <div
            key={provider.name}
            className="orbit-item"
            style={
              activeReduceMotion
                ? ({
                    "--orbit-radius": `${INNER_RADIUS}px`,
                    animation: "none",
                    transform: `rotate(${staticAngle}deg) translateX(${INNER_RADIUS}px) rotate(-${staticAngle}deg)`,
                  } as React.CSSProperties)
                : ({
                    "--orbit-radius": `${INNER_RADIUS}px`,
                    "--orbit-duration": `${INNER_DURATION}s`,
                    animationDelay: `${-(INNER_DURATION / innerProviders.length) * i}s`,
                  } as React.CSSProperties)
            }
            title={provider.name}
          >
            <ProviderCircle provider={provider} />
          </div>
        );
      })}

      {/* ── Outer orbit items (counter-clockwise, 30s) ── */}
      {outerProviders.map((provider, i) => {
        const staticAngle = (360 / outerProviders.length) * i;

        return (
          <div
            key={provider.name}
            className="orbit-item orbit-item-reverse"
            style={
              activeReduceMotion
                ? ({
                    "--orbit-radius": `${OUTER_RADIUS}px`,
                    animation: "none",
                    transform: `rotate(${staticAngle}deg) translateX(${OUTER_RADIUS}px) rotate(-${staticAngle}deg)`,
                  } as React.CSSProperties)
                : ({
                    "--orbit-radius": `${OUTER_RADIUS}px`,
                    "--orbit-duration": `${OUTER_DURATION}s`,
                    animationDelay: `${-(OUTER_DURATION / outerProviders.length) * i}s`,
                  } as React.CSSProperties)
            }
            title={provider.name}
          >
            <ProviderCircle provider={provider} />
          </div>
        );
      })}
    </div>
  );
}

/* ── Provider circle ──────────────────────────────── */

function ProviderCircle({ provider }: { provider: Provider }) {
  return (
    <div
      className="flex items-center justify-center rounded-full bg-white shadow-md select-none dark:bg-[#0f0f22]"
      style={{
        width: 40,
        height: 40,
        border: `1.5px solid ${provider.accentBorder}`,
        background: provider.accentBg,
      }}
    >
      <span
        className="font-mono text-sm font-semibold text-text-primary"
        style={{ lineHeight: 1 }}
      >
        {provider.initial}
      </span>
    </div>
  );
}
