"use client";

import { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";

interface SpatialCanvasProps {
  children: React.ReactNode;
}

export default function SpatialCanvas({ children }: SpatialCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Apply a spring to the scroll progress for fluidity
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 20,
    mass: 0.8,
  });

  // Create an overall subtle Z-axis push back as user scrolls down
  // Disabled scale down to prevent empty space below footer
  const scale = useTransform(smoothProgress, [0, 1], [1, 1]);
  const opacity = useTransform(smoothProgress, [0, 0.9, 1], [1, 1, 1]);

  return (
    <div ref={containerRef} className="relative min-h-screen">
      <motion.div
        style={{
          scale,
          opacity,
          transformOrigin: "top center",
        }}
        className="w-full relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}
