"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Monitor, Apple, Terminal, Download } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import TerminalSnippet from "@/components/ui/TerminalSnippet";
import { DESKTOP_PLATFORMS, DESKTOP_DOWNLOAD_URLS } from "@/lib/site-config";

type OS = "windows" | "macos" | "linux";

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
    return `relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2 sm:px-4 text-xs font-semibold rounded-lg transition-colors select-none z-10 cursor-pointer ${
      isActive
        ? "text-text-primary font-bold"
        : "text-text-muted hover:text-text-primary"
    }`;
  };

  const osOrder: OS[] = ["windows", "macos", "linux"];
  const handleTabKeyDown = (event: React.KeyboardEvent, current: OS) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const currentIndex = osOrder.indexOf(current);
    const offset = event.key === "ArrowRight" ? 1 : -1;
    setActiveTab(
      osOrder[(currentIndex + offset + osOrder.length) % osOrder.length]
    );
  };

  return (
    <div className="w-full mt-6 space-y-6">
      {/* OS Tab Selectors */}
      <div
        role="tablist"
        aria-label="Installation operating system"
        className="relative z-10 mx-auto flex max-w-md rounded-xl border border-border/30 bg-hover/20 p-1"
      >
        {[
          { id: "windows" as OS, label: "Windows", Icon: Monitor },
          { id: "macos" as OS, label: "macOS", Icon: Apple },
          { id: "linux" as OS, label: "Linux", Icon: Terminal },
        ].map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={getTabClass(id)}
              type="button"
              role="tab"
              id={`install-tab-${id}`}
              aria-selected={isActive}
              aria-controls="install-panel"
              tabIndex={isActive ? 0 : -1}
              onKeyDown={(event) => handleTabKeyDown(event, id)}
            >
              {isActive && (
                <motion.div
                  layoutId="activeInstallTab"
                  className="absolute inset-0 bg-surface dark:bg-zinc-800 rounded-lg shadow-sm border border-border/40 -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </div>

      {/* OS Specific Panel */}
      <Card
        variant="glass"
        padding="none"
        className="overflow-hidden border border-border/40 bg-surface/30 backdrop-blur-md animate-fade-in p-6 md:p-8"
        role="tabpanel"
        id="install-panel"
        aria-labelledby={`install-tab-${activeTab}`}
        tabIndex={0}
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
                  `${DESKTOP_PLATFORMS.windows.label} · ${DESKTOP_PLATFORMS.windows.architectures.join(", ")}`}
                {activeTab === "macos" &&
                  `${DESKTOP_PLATFORMS.macos.label} · ${DESKTOP_PLATFORMS.macos.architectures.join(", ")}`}
                {activeTab === "linux" &&
                  `Linux x86_64 · .deb, .rpm, or AppImage`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 md:self-center self-start">
            {activeTab === "windows" && (
              <Button
                href="/downloads"
                variant="primary"
                size="md"
                icon={<Download size={15} />}
              >
                View Windows download
              </Button>
            )}
            {activeTab === "macos" && (
              <Button
                href="/downloads"
                variant="primary"
                size="md"
                icon={<Download size={15} />}
              >
                View macOS download
              </Button>
            )}
            {activeTab === "linux" && (
              <Button
                href={DESKTOP_DOWNLOAD_URLS.linuxScript}
                variant="primary"
                size="md"
                icon={<Download size={15} />}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                Download install.sh
              </Button>
            )}
          </div>
        </div>

        {/* Installation Timeline/Steps */}
        <div className="mt-8 space-y-6 animate-fade-in">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-4">
            Installation steps
          </h4>

          {activeTab === "windows" && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent text-xs font-bold shrink-0">
                  1
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-text-primary mt-0.5 mb-1">
                    Download the setup installer
                  </h5>
                  <p className="text-sm text-text-secondary m-0">
                    Open the downloads page and choose the Windows setup file
                    attached to the current published release.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border/40 bg-hover/10 p-4">
                <ol className="m-0 list-decimal space-y-1 pl-4 text-xs text-text-secondary">
                  <li>Run the downloaded setup executable.</li>
                  <li>Follow the installer prompts.</li>
                  <li>Open Sythoria from the Start menu.</li>
                </ol>
              </div>

              <div className="flex gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent text-xs font-bold shrink-0">
                  2
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-text-primary mt-0.5 mb-1">
                    Connect a model
                  </h5>
                  <p className="text-sm text-text-secondary m-0">
                    Open Settings, add a provider, and run its connection check.
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
                    Download the installer script
                  </h5>
                  <p className="text-sm text-text-secondary m-0">
                    Save the tagged installer script to a local file. Do not run
                    it until you have read it.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent text-xs font-bold shrink-0">
                  2
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-text-primary mt-0.5 mb-1">
                    Inspect and run the script
                  </h5>
                  <p className="text-sm text-text-secondary m-0">
                    Download it first:
                  </p>
                  <TerminalSnippet
                    code={
                      "curl -fsSLo install-sythoria.sh " +
                      DESKTOP_DOWNLOAD_URLS.linuxScript
                    }
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent text-xs font-bold shrink-0">
                  3
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-text-primary mt-0.5 mb-1">
                    Check what was installed
                  </h5>
                  <p className="text-sm text-text-secondary m-0">
                    The script uses a Debian package, RPM package, or AppImage
                    from the latest published release. Confirm that Sythoria
                    appears in your application menu before removing the script.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
