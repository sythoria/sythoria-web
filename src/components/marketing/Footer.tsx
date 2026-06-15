"use client";

import Link from "next/link";
import { useScrollInView } from "@/hooks/useScrollInView";

const navLinks = [
  { label: "Chat", href: "/chat" },
  { label: "Docs", href: "/docs" },
  {
    label: "GitHub",
    href: "https://github.com/sythoria/sythoria-desktop",
  },
  { label: "Discord", href: "#" },
];

export default function Footer() {
  const { ref, visible } = useScrollInView();

  return (
    <footer className="relative border-t border-border/50 bg-gradient-to-b from-landing-bg to-landing-bg/95 overflow-hidden">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="footer-watermark">SYTHORIA</span>
      </div>

      <div
        ref={ref}
        className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-8"
      >
        {/* Top row: Logo + nav */}
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 scroll-animate scroll-fade-in-up stagger-1 ${visible ? "in-view" : ""}`}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-text-primary hover:text-accent transition-colors duration-300"
          >
            <img src="/logonobg.png" alt="" className="w-8 h-8" />
            <span className="text-base font-semibold tracking-tight">
              Sythoria
            </span>
          </Link>

          {/* Horizontal nav links */}
          <nav className="flex items-center gap-6 flex-wrap">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-text-secondary hover:text-accent transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="landing-section-divider my-8" />

        {/* Bottom row */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 scroll-animate scroll-fade-in-up stagger-2 ${visible ? "in-view" : ""}`}
        >
          <p className="text-[11px] text-text-muted">&copy; 2026 Sythoria</p>
          <p className="text-[11px] text-text-muted">
            Open source · MIT license · Built with privacy in mind
          </p>
        </div>
      </div>
    </footer>
  );
}
