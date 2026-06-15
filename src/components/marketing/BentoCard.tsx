"use client";

import { motion } from "framer-motion";
import {
  ReactNode,
  useRef,
  useState,
  useCallback,
  type MouseEvent,
} from "react";

/* ── Types ────────────────────────────────────────── */

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  accentColor?: string;
  delay?: number;
}

/* ── Noise texture (shared SVG data URI) ──────────── */

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { gridClass, padding } = SIZE_CONFIG[size];

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`bento-card ${gridClass} h-full flex flex-col ${className}`}
    >
      {/* ── Accent corner gradient (top-left) ──── */}
      <div
        className="pointer-events-none absolute top-0 left-0 h-32 w-32 rounded-tl-[1.25rem] opacity-20 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at 0% 0%, ${accentColor}, transparent 70%)`,
          opacity: isHovered ? 0.35 : 0.15,
        }}
      />

      {/* ── Mouse-tracking glow ────────────────── */}
      <div
        className="bento-card-glow"
        style={{
          background: accentColor,
          left: mousePos.x - 100,
          top: mousePos.y - 100,
          opacity: isHovered ? 0.15 : 0,
        }}
      />

      {/* ── Noise texture overlay ──────────────── */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-[0.015] dark:opacity-[0.03]"
        style={{ backgroundImage: NOISE_SVG }}
      />

      {/* ── Content ────────────────────────────── */}
      <div className={`relative z-10 flex h-full flex-col ${padding}`}>
        {children}
      </div>
    </motion.div>
  );
}
