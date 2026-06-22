"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useScrollInView } from "@/hooks/useScrollInView";

export default function TerminalShowcase() {
  const shouldReduceMotion = useReducedMotion();
  const { ref: sectionRef, visible: sectionVisible } = useScrollInView(0.15);

  /* ── 3D tilt on scroll ─────────────────────────── */
  const terminalWrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: terminalWrapperRef,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [6, 0, -4]);
  const tiltY = useTransform(scrollYProgress, [0, 1], [10, -10]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden px-6 py-24 md:py-32"
    >
      {/* ── Section heading ────────────────────── */}
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={sectionVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4 inline-block font-mono text-xs font-semibold uppercase tracking-[0.25em] text-accent"
        >
          Experience
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={sectionVisible ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.8,
            delay: 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="text-3xl font-bold tracking-tight text-text-primary md:text-5xl"
        >
          See it in action
        </motion.h2>
      </div>

      {/* ── Terminal wrapper (3D perspective) ───── */}
      <div
        ref={terminalWrapperRef}
        className="relative mx-auto max-w-4xl"
        style={{ perspective: 1200 }}
      >
        <motion.div
          style={
            shouldReduceMotion ? undefined : { rotateX, translateY: tiltY }
          }
          className="relative"
        >
          {/* ── Floating labels ──────────────────── */}
          <div className="terminal-label terminal-label-left -right-2 top-12 md:-right-6 z-20 hidden sm:block">
            Real-time Demonstration
          </div>
          <div className="terminal-label terminal-label-right -left-2 bottom-16 md:-left-6 z-20 hidden sm:block">
            High Precision Interface
          </div>

          {/* ── Terminal frame ────────────────────── */}
          <div className="terminal-frame overflow-hidden">
            {/* Header (traffic lights) */}
            <div className="terminal-header">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
              <span className="ml-auto font-mono text-[11px] text-text-muted select-none">
                sythoria
              </span>
            </div>

            {/* Terminal body with video */}
            <div className="terminal-body !p-0 overflow-hidden rounded-b-xl aspect-video bg-black flex items-center justify-center">
              <video
                src="/demo.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
