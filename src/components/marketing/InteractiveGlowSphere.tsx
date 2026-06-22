"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

export default function InteractiveGlowSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [mouse, setMouse] = useState({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    canvas.width = 450;
    canvas.height = 450;

    // Handle high DPI screens
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Particle structure
    interface Particle {
      theta: number; // angle 1
      phi: number; // angle 2
      baseRadius: number;
      speed: number;
      color: string;
      size: number;
    }

    const particles: Particle[] = [];
    const particleCount = 280;

    // Generate particles on a sphere
    for (let i = 0; i < particleCount; i++) {
      // Golden spiral distribution for even spacing on sphere
      const theta = Math.acos(1 - 2 * (i / particleCount));
      const phi = Math.PI * (1 + Math.sqrt(5)) * i;

      particles.push({
        theta,
        phi,
        baseRadius: 130 + Math.random() * 10,
        speed: 0.005 + Math.random() * 0.005,
        color:
          i % 2 === 0 ? "rgba(142, 157, 204, 0.7)" : "rgba(217, 219, 241, 0.5)",
        size: 1.2 + Math.random() * 1.5,
      });
    }

    let rotX = 0;
    let rotY = 0;
    let time = 0;
    let pulse = 0;

    // Track mouse
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      setMouse((prev) => ({
        ...prev,
        targetX: x * 0.003,
        targetY: y * 0.003,
      }));
    };

    const handleMouseEnter = () => setHovered(true);
    const handleMouseLeave = () => {
      setHovered(false);
      setMouse((prev) => ({ ...prev, targetX: 0, targetY: 0 }));
    };

    const handleClick = () => {
      pulse = 1.8; // Trigger pulse effect
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("click", handleClick);

    // Render loop
    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.clearRect(0, 0, w, h);
      time += 0.004;

      // Decay pulse
      if (pulse > 0) {
        pulse += (0 - pulse) * 0.08;
      }

      // Smooth mouse rotation
      if (!shouldReduceMotion) {
        rotX += (mouse.targetY - rotX) * 0.08;
        rotY += (mouse.targetX - rotY) * 0.08;
      }

      // Standard slow auto rotation
      const currentRotX = rotX + time * 0.15;
      const currentRotY = rotY + time * 0.25;

      // Draw background ambient glow inside canvas
      const glowGrad = ctx.createRadialGradient(
        w / 2,
        h / 2,
        0,
        w / 2,
        h / 2,
        200
      );
      const isDark = document.documentElement.classList.contains("dark");

      glowGrad.addColorStop(
        0,
        isDark ? "rgba(142, 157, 204, 0.15)" : "rgba(142, 157, 204, 0.1)"
      );
      glowGrad.addColorStop(0.5, "rgba(217, 219, 241, 0.02)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 200, 0, Math.PI * 2);
      ctx.fill();

      // Transform and project particles
      const projected: {
        x: number;
        y: number;
        z: number;
        size: number;
        color: string;
      }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Morph sphere radius organically using sine/cosine waves (perlin approximation)
        const morph =
          Math.sin(time * 3 + p.theta * 4) *
          Math.cos(time * 2 + p.phi * 5) *
          12;
        const radius =
          p.baseRadius + morph + pulse * 30 * Math.sin(p.theta * 5);

        // Spherical to 3D Cartesian coordinates
        const x = radius * Math.sin(p.theta) * Math.cos(p.phi);
        const y = radius * Math.sin(p.theta) * Math.sin(p.phi);
        const z = radius * Math.cos(p.theta);

        // Rotate on X axis
        const cosX = Math.cos(currentRotX);
        const sinX = Math.sin(currentRotX);
        const y1 = y * cosX - z * sinX;
        const z1 = y * sinX + z * cosX;

        // Rotate on Y axis
        const cosY = Math.cos(currentRotY);
        const sinY = Math.sin(currentRotY);
        const x2 = x * cosY - z1 * sinY;
        const z2 = x * sinY + z1 * cosY;

        // 3D perspective projection
        const cameraDistance = 400;
        const scale = cameraDistance / (cameraDistance + z2);

        projected.push({
          x: w / 2 + x2 * scale,
          y: h / 2 + y1 * scale,
          z: z2, // keep depth for sorting
          size: p.size * scale * (hovered ? 1.15 : 1),
          color: p.color,
        });
      }

      // Sort by depth (Z-buffer) from back to front
      projected.sort((a, b) => b.z - a.z);

      // Draw projected particles
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];

        // Calculate depth opacity (further away = fainter)
        const depthOpacity = Math.max(0.1, Math.min(1, (300 - p.z) / 400));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        // Adjust particle color with depth opacity
        const colorWithDepth = p.color.replace(
          /[\d.]+\)$/,
          `${depthOpacity * 0.85})`
        );

        ctx.fillStyle = colorWithDepth;
        ctx.shadowBlur = hovered ? 6 : 2;
        ctx.shadowColor = "rgba(142, 157, 204, 0.4)";
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [shouldReduceMotion, hovered, mouse.targetX, mouse.targetY]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] sm:h-[450px] flex items-center justify-center cursor-pointer select-none"
    >
      <canvas ref={canvasRef} className="absolute pointer-events-none" />

      {/* Decorative center ring overlay */}
      <div className="absolute w-44 h-44 rounded-full border border-white/5 dark:border-white/5 bg-gradient-to-tr from-white/5 via-transparent to-white/5 backdrop-blur-[2px] pointer-events-none flex items-center justify-center shadow-inner">
        <img
          src="/logonobg.png"
          alt="Sythoria Logo"
          className="w-16 h-16 opacity-85 hover:scale-110 transition-transform duration-500 ease-out"
        />
      </div>
    </div>
  );
}
