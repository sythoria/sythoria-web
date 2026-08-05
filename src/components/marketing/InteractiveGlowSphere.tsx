"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

interface Particle {
  theta: number;
  phi: number;
  radius: number;
  size: number;
  color: string;
}

interface ProjectedParticle {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
}

const PARTICLE_COUNT = 160;
const particles: Particle[] = Array.from(
  { length: PARTICLE_COUNT },
  (_, index) => ({
    theta: Math.acos(1 - 2 * (index / PARTICLE_COUNT)),
    phi: Math.PI * (1 + Math.sqrt(5)) * index,
    radius: 130 + ((index * 17) % 10),
    size: 1.2 + ((index * 13) % 15) / 10,
    color: index % 2 === 0 ? "rgb(142, 157, 204)" : "rgb(217, 219, 241)",
  })
);

export default function InteractiveGlowSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !container || !context) return;

    let frameId = 0;
    let visible = true;
    let lastTime = 0;
    let time = 0;
    let targetX = 0;
    let targetY = 0;
    let rotationX = 0;
    let rotationY = 0;
    let width = 450;
    let height = 450;

    const projected: ProjectedParticle[] = particles.map(() => ({
      x: 0,
      y: 0,
      z: 0,
      size: 0,
      color: "",
    }));

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (dt: number) => {
      context.clearRect(0, 0, width, height);
      const dark = document.documentElement.classList.contains("dark");
      const glow = context.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        200
      );
      glow.addColorStop(
        0,
        dark ? "rgba(142, 157, 204, 0.15)" : "rgba(142, 157, 204, 0.1)"
      );
      glow.addColorStop(0.5, "rgba(217, 219, 241, 0.02)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = glow;
      context.beginPath();
      context.arc(width / 2, height / 2, 200, 0, Math.PI * 2);
      context.fill();

      // Smooth frame-rate independent rotation lerping (hover response)
      const lerpFactor = 1 - Math.exp(-14 * dt);
      rotationX += (targetY - rotationX) * lerpFactor;
      rotationY += (targetX - rotationY) * lerpFactor;

      const currentX = rotationX + time * 0.15;
      const currentY = rotationY + time * 0.25;
      const cosX = Math.cos(currentX);
      const sinX = Math.sin(currentX);
      const cosY = Math.cos(currentY);
      const sinY = Math.sin(currentY);

      particles.forEach((particle, index) => {
        const morph =
          Math.sin(time * 3 + particle.theta * 4) *
          Math.cos(time * 2 + particle.phi * 5) *
          12;
        const radius = particle.radius + morph;
        const x = radius * Math.sin(particle.theta) * Math.cos(particle.phi);
        const y = radius * Math.sin(particle.theta) * Math.sin(particle.phi);
        const z = radius * Math.cos(particle.theta);
        const rotatedY = y * cosX - z * sinX;
        const rotatedZ = y * sinX + z * cosX;
        const rotatedX = x * cosY - rotatedZ * sinY;
        const depth = x * sinY + rotatedZ * cosY;
        const scale = 400 / (400 + depth);
        const output = projected[index];
        output.x = width / 2 + rotatedX * scale;
        output.y = height / 2 + rotatedY * scale;
        output.z = depth;
        output.size = particle.size * scale;
        output.color = particle.color;
      });

      projected.sort((a, b) => b.z - a.z);
      for (const particle of projected) {
        const opacity = Math.max(0.1, Math.min(0.85, (300 - particle.z) / 400));
        context.globalAlpha = opacity;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = particle.color;
        context.fill();
      }
      context.globalAlpha = 1.0;
    };

    const animate = (timestamp: number) => {
      if (!visible || document.hidden) return;
      const dt = lastTime
        ? Math.min((timestamp - lastTime) / 1000, 0.05)
        : 0.016;
      lastTime = timestamp;
      time += shouldReduceMotion ? dt * 0.25 : dt;
      draw(dt);
      frameId = window.requestAnimationFrame(animate);
    };

    const start = () => {
      window.cancelAnimationFrame(frameId);
      if (visible && !document.hidden) {
        lastTime = performance.now();
        frameId = window.requestAnimationFrame(animate);
      } else {
        draw(0.016);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      targetX = (event.clientX - rect.left - rect.width / 2) * 0.003;
      targetY = (event.clientY - rect.top - rect.height / 2) * 0.003;
    };
    const resetPointer = () => {
      targetX = 0;
      targetY = 0;
    };
    const handleVisibility = () => start();
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        start();
      },
      { rootMargin: "100px" }
    );

    resize();
    draw(0.016);
    start();
    observer.observe(container);
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    container.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    container.addEventListener("pointerleave", resetPointer, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", resetPointer);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex h-[400px] w-full select-none items-center justify-center sm:h-[450px]"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute transform-gpu [transform:translateZ(0)]"
      />
      <div className="pointer-events-none absolute flex h-44 w-44 items-center justify-center rounded-full border border-white/5 bg-gradient-to-tr from-white/5 via-transparent to-white/5 shadow-inner backdrop-blur-[2px]">
        <Image
          src="/logonobg.png"
          alt=""
          width={64}
          height={64}
          className="h-16 w-16 opacity-85"
        />
      </div>
    </div>
  );
}
