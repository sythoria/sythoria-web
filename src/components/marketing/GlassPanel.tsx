"use client";

import { motion } from "framer-motion";
import { ReactNode, useRef, useState, MouseEvent } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function GlassPanel({
  children,
  className = "",
  delay = 0,
}: GlassPanelProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02, z: 20 }}
      className={`relative h-full rounded-3xl overflow-hidden bg-landing-card backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-xl shadow-black/5 dark:shadow-black/40 transition-transform ${className}`}
      style={{ transform: "translateZ(0)" }}
    >
      {/* Dynamic hover glow */}
      <motion.div
        className="absolute w-[200px] h-[200px] rounded-full blur-2xl pointer-events-none"
        style={{
          background: "var(--color-chrome-glow)",
        }}
        animate={{
          x: mousePosition.x - 100,
          y: mousePosition.y - 100,
          opacity: isHovered ? 0.3 : 0,
        }}
        transition={{ type: "tween", ease: "linear", duration: 0.1 }}
      />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 h-full p-6 flex flex-col">{children}</div>
    </motion.div>
  );
}
