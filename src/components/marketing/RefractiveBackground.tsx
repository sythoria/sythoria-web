"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export default function RefractiveBackground() {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || shouldReduceMotion) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mounted, shouldReduceMotion]);

  const activeReduceMotion = mounted ? !!shouldReduceMotion : false;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-landing-bg transition-colors duration-500">
      {/* Dot grid pattern with parallax */}
      <motion.div
        className="absolute inset-0 dot-grid-bg"
        style={activeReduceMotion ? undefined : { y: -(scrollY * 0.05) }}
      />

      {/* Primary gradient orb — large, centered, slow pulse */}
      <motion.div
        className="absolute rounded-full blur-[120px] animate-glow-pulse"
        style={{
          width: "70vw",
          height: "70vh",
          top: "50%",
          left: "50%",
          x: "-50%",
          y: "-50%",
          background:
            "radial-gradient(circle, var(--color-glow-primary), transparent 70%)",
          opacity: 0.35,
        }}
        animate={
          activeReduceMotion
            ? {}
            : {
                x: ["-50%", "-46%", "-54%", "-50%"],
                y: ["-50%", "-46%", "-54%", "-50%"],
              }
        }
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Secondary gradient orb — smaller, bottom-right, different timing */}
      <motion.div
        className="absolute rounded-full blur-[100px] animate-glow-pulse"
        style={{
          width: "40vw",
          height: "40vh",
          bottom: "10%",
          right: "10%",
          background:
            "radial-gradient(circle, var(--color-glow-secondary), transparent 70%)",
          opacity: 0.25,
          animationDelay: "2s",
        }}
        animate={
          activeReduceMotion
            ? {}
            : {
                x: ["0%", "5%", "-3%", "0%"],
                y: ["0%", "-5%", "3%", "0%"],
              }
        }
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Noise overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
