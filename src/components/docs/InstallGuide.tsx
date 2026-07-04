"use client";

import { useState, useEffect } from "react";
import { Monitor, Apple, Terminal, Download, Check, Copy } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

type OS = "windows" | "macos" | "linux";

const TerminalSnippet = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="mt-2 flex items-center justify-between gap-4 font-mono text-sm bg-black/5 dark:bg-black/30 border border-border/50 rounded-lg py-2 px-3.5 max-w-lg select-none">
      <span className="text-text-primary dark:text-text-primary select-all break-all overflow-x-auto whitespace-pre font-medium">
        {code}
      </span>
      <button
        onClick={handleCopy}
        className="text-text-muted hover:text-text-primary p-1.5 rounded-md hover:bg-hover dark:hover:bg-white/5 transition-colors shrink-0"
        title="Copy to clipboard"
        type="button"
      >
        {copied ? (
          <Check size={14} className="text-green-500" />
        ) : (
          <Copy size={14} />
        )}
      </button>
    </div>
  );
};

export default function InstallGuide() {
  const [activeTab, setActiveTab] = useState<OS>("windows");
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
      setActiveTab(detected);
      setDetectedOS(detected);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const getTabClass = (tab: OS) => {
    const isActive = activeTab === tab;
    return `flex-1 flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold rounded-lg transition-all duration-200 select-none ${
      isActive
        ? "bg-surface dark:bg-zinc-800 text-text-primary shadow-sm border border-border/40"
        : "text-text-muted hover:text-text-primary hover:bg-hover/40"
    }`;
  };

  return (
    <div className="w-full mt-6 space-y-6">
      {/* OS Tab Selectors */}
      <div className="flex border border-border/30 bg-hover/20 rounded-xl p-1 max-w-md mx-auto relative z-10">
        <button
          onClick={() => setActiveTab("windows")}
          className={getTabClass("windows")}
          type="button"
        >
          <Monitor size={15} />
          Windows
        </button>
        <button
          onClick={() => setActiveTab("macos")}
          className={getTabClass("macos")}
          type="button"
        >
          <Apple size={15} />
          macOS
        </button>
        <button
          onClick={() => setActiveTab("linux")}
          className={getTabClass("linux")}
          type="button"
        >
          <Terminal size={15} />
          Linux
        </button>
      </div>

      {/* OS Specific Panel */}
      <Card
        variant="glass"
        padding="none"
        className="overflow-hidden border border-border/40 bg-surface/30 backdrop-blur-md animate-fade-in p-6 md:p-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
              {activeTab === "windows" && <Monitor size={24} />}
              {activeTab === "macos" && <Apple size={24} />}
              {activeTab === "linux" && <Terminal size={24} />}
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary m-0 flex items-center gap-2 animate-fade-in">
                {activeTab === "windows" && "Windows Desktop"}
                {activeTab === "macos" && "macOS Desktop"}
                {activeTab === "linux" && "Linux Desktop"}
                {detectedOS === activeTab && (
                  <Badge
                    variant="success"
                    className="text-[10px] py-0.5 px-1.5 font-medium tracking-wide"
                  >
                    Your OS
                  </Badge>
                )}
              </h3>
              <p className="text-xs text-text-muted mt-0.5 mb-0">
                {activeTab === "windows" &&
                  "Standalone application for Windows 10/11"}
                {activeTab === "macos" &&
                  "Supports Apple Silicon and Intel Macs"}
                {activeTab === "linux" && "Packaged as an executable AppImage"}
              </p>
            </div>
          </div>

          <Button
            href="https://github.com/sythoria/sythoria-desktop/releases/latest"
            variant="primary"
            size="md"
            icon={<Download size={15} />}
            target="_blank"
            rel="noopener noreferrer"
            className="md:self-center self-start"
          >
            {activeTab === "windows" && "Download for Windows (.exe)"}
            {activeTab === "macos" && "Download for macOS (.dmg)"}
            {activeTab === "linux" && "Download for Linux (.AppImage)"}
          </Button>
        </div>

        {/* Installation Timeline/Steps */}
        <div className="mt-8 space-y-6 animate-fade-in">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-4">
            Installation Steps
          </h4>

          {activeTab === "windows" && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent text-xs font-bold shrink-0">
                  1
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-text-primary mt-0.5 mb-1">
                    Download the executable
                  </h5>
                  <p className="text-sm text-text-secondary m-0">
                    Click the download button above to get the latest release
                    installer (`.exe`).
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent text-xs font-bold shrink-0">
                  2
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-text-primary mt-0.5 mb-1">
                    Run the Installer
                  </h5>
                  <p className="text-sm text-text-secondary m-0">
                    Double-click the downloaded setup file to launch the
                    installation wizard.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent text-xs font-bold shrink-0">
                  3
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-text-primary mt-0.5 mb-1">
                    Complete Setup
                  </h5>
                  <p className="text-sm text-text-secondary m-0">
                    Follow the prompts to finalize the installation. Sythoria
                    will launch automatically.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "macos" && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent text-xs font-bold shrink-0">
                  1
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-text-primary mt-0.5 mb-1">
                    Download the disk image
                  </h5>
                  <p className="text-sm text-text-secondary m-0">
                    Click the download button above to get the macOS
                    installation package (`.dmg`).
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent text-xs font-bold shrink-0">
                  2
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-text-primary mt-0.5 mb-1">
                    Drag to Applications
                  </h5>
                  <p className="text-sm text-text-secondary m-0">
                    Open the downloaded disk image and drag the{" "}
                    <strong>Sythoria</strong> app icon to your{" "}
                    <strong>Applications</strong> folder.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent text-xs font-bold shrink-0">
                  3
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-text-primary mt-0.5 mb-1">
                    Launch the app
                  </h5>
                  <p className="text-sm text-text-secondary m-0">
                    Eject the installer disk image, open Applications, and
                    double-click <strong>Sythoria</strong> to start.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "linux" && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent text-xs font-bold shrink-0">
                  1
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-text-primary mt-0.5 mb-1">
                    Download the AppImage
                  </h5>
                  <p className="text-sm text-text-secondary m-0">
                    Click the download button above to retrieve the package
                    (`.AppImage`).
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent text-xs font-bold shrink-0">
                  2
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-text-primary mt-0.5 mb-1">
                    Open your terminal
                  </h5>
                  <p className="text-sm text-text-secondary m-0">
                    Navigate to the directory where you downloaded the file
                    (usually `~/Downloads`).
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent text-xs font-bold shrink-0">
                  3
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-text-primary mt-0.5 mb-1">
                    Make executable
                  </h5>
                  <p className="text-sm text-text-secondary m-0">
                    Run the following command to make the AppImage executable:
                  </p>
                  <TerminalSnippet code="chmod +x Sythoria-*.AppImage" />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent text-xs font-bold shrink-0">
                  4
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-text-primary mt-0.5 mb-1">
                    Launch Sythoria
                  </h5>
                  <p className="text-sm text-text-secondary m-0">
                    Double-click the file in your file manager or launch it from
                    the command line:
                  </p>
                  <TerminalSnippet code="./Sythoria-*.AppImage" />
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
