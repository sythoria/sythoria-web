"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  ArrowLeft,
  Download,
  BookOpen,
  History,
  Compass,
} from "lucide-react";
import Button from "@/components/ui/Button";

interface RescueLink {
  title: string;
  description: string;
  href: string;
  icon: typeof Download;
  badge?: string;
}

const rescueLinks: RescueLink[] = [
  {
    title: "Download Desktop Client",
    description:
      "Get the native, privacy-first desktop application for Windows, macOS, or Linux.",
    href: "/downloads",
    icon: Download,
    badge: "Native App",
  },
  {
    title: "Documentation & Quickstart",
    description:
      "Explore setup guides, API provider configurations, shortcuts, and troubleshooting.",
    href: "/docs",
    icon: BookOpen,
    badge: "Docs",
  },
  {
    title: "Releases & Changelog",
    description:
      "Review the latest desktop versions, feature additions, and release notes.",
    href: "/changelog",
    icon: History,
    badge: "Updates",
  },
];

export default function NotFoundClientView() {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-20 sm:pt-32 sm:pb-24">
      {/* Header Pill */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-semibold tracking-wide animate-fade-in shadow-xs">
          <Compass size={14} className="text-accent" />
          <span>Error 404</span>
          <span className="text-text-muted font-normal">·</span>
          <span className="text-text-secondary">Route Not Found</span>
        </div>
      </div>

      {/* BIG CUSTOM 404 DISPLAY WITH BLACK GRADIENT */}
      <div className="relative flex flex-col items-center justify-center my-6 sm:my-10">
        <div className="not-found-glow" aria-hidden="true" />
        <h1
          className="not-found-number font-black select-none tracking-tighter"
          aria-label="404 - Page Not Found"
        >
          404
        </h1>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
        <Button
          href="/"
          variant="primary"
          size="lg"
          icon={<Home size={18} />}
          className="shadow-md shadow-accent/20"
        >
          Return Home
        </Button>
        <Button
          onClick={handleGoBack}
          variant="secondary"
          size="lg"
          icon={<ArrowLeft size={18} />}
        >
          Go Back
        </Button>
      </div>

      {/* Recommended Waypoints / Rescue Grid */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Recommended Destinations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rescueLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col justify-between p-5 rounded-xl border border-border/50 bg-surface/30 hover:bg-surface/70 hover:border-accent/40 backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
                      <Icon size={18} />
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-border/40 text-text-muted group-hover:text-accent group-hover:border-accent/30 transition-colors">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/20 flex items-center text-xs font-medium text-accent group-hover:text-accent-hover transition-colors">
                  <span>Explore</span>
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 ml-1">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
