"use client";

import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useScrollInView } from "@/hooks/useScrollInView";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Chat", href: "/chat" },
      { label: "Docs", href: "/docs" },
      { label: "Features", href: "#features" },
      { label: "Security", href: "#comparison" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "GitHub", href: "https://github.com/sythoria/sythoria-desktop" },
      { label: "Documentation", href: "/docs" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Discord", href: "#" },
      {
        label: "Issues",
        href: "https://github.com/sythoria/sythoria-desktop/issues",
      },
      {
        label: "Discussions",
        href: "https://github.com/sythoria/sythoria-desktop/discussions",
      },
    ],
  },
];

export default function Footer() {
  const { ref, visible } = useScrollInView();

  return (
    <footer className="border-t border-border/50 pt-16 pb-8 px-6">
      <div ref={ref} className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-14">
          <div
            className={`col-span-2 sm:col-span-1 scroll-animate scroll-fade-in-up stagger-1 ${visible ? "in-view" : ""}`}
          >
            <Link
              href="/"
              className="flex items-center gap-2 text-text-primary hover:text-accent transition-colors duration-300 mb-4"
            >
              <MessageSquare
                size={18}
                className="text-accent"
                strokeWidth={1.5}
              />
              <span className="text-base font-semibold tracking-tight">
                Sythoria
              </span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed max-w-xs">
              Privacy-first AI chat interface. Your keys, your data, your
              control.
            </p>
          </div>

          {footerLinks.map((group, i) => (
            <div
              key={group.title}
              className={`scroll-animate scroll-fade-in-up stagger-${Math.min(i + 2, 5)} ${visible ? "in-view" : ""}`}
            >
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-accent transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="landing-section-divider mb-6" />

        <div
          className={`flex flex-col sm:flex-row items-center justify-between gap-4 scroll-animate scroll-fade-in-up stagger-5 ${visible ? "in-view" : ""}`}
        >
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Sythoria. Privacy-first AI.
          </p>
          <p className="text-xs text-text-muted">
            Open source under MIT license
          </p>
        </div>
      </div>
    </footer>
  );
}
