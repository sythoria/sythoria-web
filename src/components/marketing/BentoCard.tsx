"use client";

import { motion } from "framer-motion";
import {
  ReactNode,
  useRef,
  type CSSProperties,
  type PointerEvent,
} from "react";

/* ── Types ────────────────────────────────────────── */

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  accentColor?: string;
  delay?: number;
}

/* ── Size → CSS class & padding map ───────────────── */

const SIZE_CONFIG = {
  sm: { gridClass: "bento-sm", padding: "p-6" },
  md: { gridClass: "bento-md", padding: "p-6 md:p-8" },
  lg: { gridClass: "bento-lg", padding: "p-6 md:p-8" },
} as const;

/* ── Component ────────────────────────────────────── */

export default function BentoCard({
  children,
  className = "",
  size = "sm",
  accentColor = "var(--color-accent)",
  delay = 0,
}: BentoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const { gridClass, padding } = SIZE_CONFIG[size];

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--bento-glow-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--bento-glow-y", `${event.clientY - rect.top}px`);
  };

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ "--bento-accent": accentColor } as CSSProperties}
      className={`bento-card glass-edge-hover group ${gridClass} h-full flex flex-col ${className}`}
    >
      {/* ── Accent corner gradient (top-left) ──── */}
      <div
        className="pointer-events-none absolute top-0 left-0 h-32 w-32 rounded-tl-[1.25rem] opacity-15 transition-opacity duration-500 group-hover:opacity-35"
        style={{
          background: `radial-gradient(ellipse at 0% 0%, ${accentColor}, transparent 70%)`,
        }}
      />

      {/* ── Mouse-tracking glow ────────────────── */}
      <div
        className="bento-card-glow opacity-0 group-hover:opacity-15"
        style={{
          background: "var(--bento-accent)",
          left: "calc(var(--bento-glow-x, 50%) - 100px)",
          top: "calc(var(--bento-glow-y, 50%) - 100px)",
        }}
      />

      {/* ── Noise texture overlay ──────────────── */}
      <div className="noise-overlay pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-[0.015] dark:opacity-[0.03]" />

      {/* ── Content ────────────────────────────── */}
      <div className={`relative z-10 flex h-full flex-col ${padding}`}>
        {children}
      </div>
    </motion.div>
  );
}
