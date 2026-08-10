"use client";

import { useState, useEffect } from "react";
import { Monitor, Apple, Terminal, Download, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import TerminalSnippet from "@/components/ui/TerminalSnippet";
import { formatBytes } from "@/utils/formatters";

type OS = "windows" | "macos" | "linux";

interface DownloadCardsProps {
  releaseUrl: string;
  windowsSetupUrl?: string;
  macDmgUrl?: string;
  linuxScriptUrl: string;
  windowsSetupSize?: number;
  macDmgSize?: number;
}

export default function DownloadCards({
  releaseUrl,
  windowsSetupUrl,
  macDmgUrl,
  linuxScriptUrl,
  windowsSetupSize,
  macDmgSize,
}: DownloadCardsProps) {
  const [detectedOS, setDetectedOS] = useState<OS | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    let detected: OS = "windows";

    if (ua.includes("mac")) {
      detected = "macos";
    } else if (ua.includes("linux")) {
      detected = "linux";
    }

    const timer = setTimeout(() => {
      setDetectedOS(detected);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const getCardClassName = (os: OS) => {
    const isDetected = detectedOS === os;
    return `flex flex-col justify-between space-y-6 border transition-all duration-300 relative overflow-hidden group ${
      isDetected
        ? "border-accent/60 bg-surface/50 shadow-lg shadow-accent/5 ring-1 ring-accent/30"
        : "border-border/40 bg-surface/30 backdrop-blur-md hover:border-accent/40"
    }`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      {/* WINDOWS CARD */}
      <Card
        variant="glass"
        padding="lg"
        className={getCardClassName("windows")}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-accent/10 text-accent">
              <Monitor size={28} />
            </div>
            <div className="flex items-center gap-2">
              {detectedOS === "windows" && (
                <Badge
                  variant="success"
                  className="text-[11px] py-0.5 px-2 font-semibold flex items-center gap-1 animate-fade-in"
                >
                  <CheckCircle2 size={12} />
                  Your OS
                </Badge>
              )}
              <Badge variant="accent" className="text-xs font-semibold">
                Windows 10/11
              </Badge>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary m-0">
              Windows (x64)
            </h2>
            <p className="text-xs text-text-secondary mt-1 m-0">
              x64 setup installer for Windows 10 or 11.
            </p>
          </div>

          {/* Windows Action Buttons */}
          <div className="space-y-2.5 pt-2">
            {windowsSetupUrl && (
              <Button
                href={windowsSetupUrl}
                variant="primary"
                fullWidth
                size="md"
                icon={<Download size={16} />}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                Setup Installer (.exe)
              </Button>
            )}

            {!windowsSetupUrl && (
              <Button
                href={releaseUrl}
                variant="secondary"
                fullWidth
                size="md"
                target="_blank"
                rel="noopener noreferrer"
              >
                Check GitHub release
              </Button>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-border/30 text-xs text-text-muted space-y-1.5">
          {windowsSetupUrl && (
            <div className="flex items-center justify-between">
              <span>Setup Installer:</span>
              <span className="font-mono text-text-secondary">
                {windowsSetupSize
                  ? formatBytes(windowsSetupSize)
                  : "See GitHub"}
              </span>
            </div>
          )}
          {!windowsSetupUrl && (
            <p className="m-0">No Windows file is attached yet.</p>
          )}
        </div>
      </Card>

      {/* MACOS CARD */}
      <Card variant="glass" padding="lg" className={getCardClassName("macos")}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-accent/10 text-accent">
              <Apple size={28} />
            </div>
            <div className="flex items-center gap-2">
              {detectedOS === "macos" && (
                <Badge
                  variant="success"
                  className="text-[11px] py-0.5 px-2 font-semibold flex items-center gap-1 animate-fade-in"
                >
                  <CheckCircle2 size={12} />
                  Your OS
                </Badge>
              )}
              <Badge variant="accent" className="text-xs font-semibold">
                macOS 12+
              </Badge>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary m-0">
              macOS (Apple Silicon)
            </h2>
            <p className="text-xs text-text-secondary mt-1 m-0">
              Apple silicon build for macOS 12 or later.
            </p>
          </div>

          {/* macOS Action Button */}
          <div className="pt-2">
            <Button
              href={macDmgUrl ?? releaseUrl}
              variant="primary"
              fullWidth
              size="md"
              icon={<Download size={16} />}
              target="_blank"
              rel="noopener noreferrer"
              download={Boolean(macDmgUrl)}
            >
              {macDmgUrl ? "Download macOS (.dmg)" : "Check GitHub release"}
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-border/30 text-xs text-text-muted space-y-1.5">
          <div className="flex items-center justify-between">
            <span>Architecture:</span>
            <span className="font-mono text-text-secondary">
              Apple Silicon (arm64)
            </span>
          </div>
          {macDmgUrl ? (
            <div className="flex items-center justify-between">
              <span>Disk Image Size:</span>
              <span className="font-mono text-text-secondary">
                {macDmgSize ? formatBytes(macDmgSize) : "See GitHub"}
              </span>
            </div>
          ) : (
            <p className="m-0">No macOS disk image is attached yet.</p>
          )}
        </div>
      </Card>

      {/* LINUX CARD */}
      <Card variant="glass" padding="lg" className={getCardClassName("linux")}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-accent/10 text-accent">
              <Terminal size={28} />
            </div>
            <div className="flex items-center gap-2">
              {detectedOS === "linux" && (
                <Badge
                  variant="success"
                  className="text-[11px] py-0.5 px-2 font-semibold flex items-center gap-1 animate-fade-in"
                >
                  <CheckCircle2 size={12} />
                  Your OS
                </Badge>
              )}
              <Badge variant="accent" className="text-xs font-semibold">
                Linux x86_64
              </Badge>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary m-0">
              Linux Desktop
            </h2>
            <p className="text-xs text-text-secondary mt-1 m-0">
              The installer checks the latest published release for a Debian,
              RPM, or AppImage package.
            </p>
          </div>

          {/* Terminal Install Command */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Quick Install Command
            </span>
            <TerminalSnippet
              code={`curl -fsSLo install-sythoria.sh ${linuxScriptUrl}`}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border/30 text-xs text-text-muted space-y-1.5">
          <div className="flex items-center justify-between">
            <span>Terminal Install:</span>
            <span className="font-mono text-[11px] text-accent truncate">
              inspect, then run
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Package Formats:</span>
            <span className="font-mono text-text-secondary">
              .deb, .rpm, .AppImage
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
