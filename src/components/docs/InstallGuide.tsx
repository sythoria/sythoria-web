"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Monitor, Apple, Terminal, Download } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { DESKTOP_PLATFORMS, DESKTOP_DOWNLOAD_URLS } from "@/lib/site-config";

type OS = "windows" | "macos" | "linux";

import TerminalSnippet from "@/components/ui/TerminalSnippet";

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
                  `Universal Installer · Debian, Ubuntu, Fedora, Arch & more`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 md:self-center self-start">
            {activeTab === "windows" && (
              <>
                <Button
                  href={DESKTOP_DOWNLOAD_URLS.windowsSetup}
                  variant="primary"
                  size="md"
                  icon={<Download size={15} />}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  Setup Installer (.exe)
                </Button>
                <Button
                  href={DESKTOP_DOWNLOAD_URLS.windowsPortable}
                  variant="secondary"
                  size="md"
                  icon={<Download size={15} />}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  Portable Version (.exe)
                </Button>
              </>
            )}
            {activeTab === "macos" && (
              <Button
                href={DESKTOP_DOWNLOAD_URLS.macDmg}
                variant="primary"
                size="md"
                icon={<Download size={15} />}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                macOS arm64 (.dmg)
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
                    Choose your installation package
                  </h5>
                  <p className="text-sm text-text-secondary m-0">
                    Download either the <strong>Setup Installer (.exe)</strong>{" "}
                    for standard installation with Start menu integration, or
                    the <strong>Portable Version (.exe)</strong> to run Sythoria
                    without administrator rights or installation.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-xl border border-border/40 bg-hover/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="accent"
                      className="text-[10px] px-2 py-0.5 font-semibold"
                    >
                      Option A: Setup Installer
                    </Badge>
                  </div>
                  <h6 className="text-xs font-bold text-text-primary m-0">
                    Setup (.exe)
                  </h6>
                  <ol className="text-xs text-text-secondary pl-4 space-y-1 list-decimal m-0">
                    <li>
                      Run <code>Sythoria_x64-setup.exe</code>.
                    </li>
                    <li>Follow the setup wizard to install Sythoria.</li>
                    <li>Launch via desktop shortcut or Start Menu.</li>
                  </ol>
                </div>

                <div className="p-4 rounded-xl border border-border/40 bg-hover/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] px-2 py-0.5 font-semibold"
                    >
                      Option B: Portable Version
                    </Badge>
                  </div>
                  <h6 className="text-xs font-bold text-text-primary m-0">
                    Portable (.exe)
                  </h6>
                  <ol className="text-xs text-text-secondary pl-4 space-y-1 list-decimal m-0">
                    <li>
                      Download <code>sythoria_windows_x64.exe</code> (or extract
                      the portable archive).
                    </li>
                    <li>
                      Double-click <code>sythoria_windows_x64.exe</code> to run
                      directly.
                    </li>
                    <li>No installation or admin privileges required.</li>
                  </ol>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent text-xs font-bold shrink-0">
                  2
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-text-primary mt-0.5 mb-1">
                    Launch & Configure
                  </h5>
                  <p className="text-sm text-text-secondary m-0">
                    Once launched, open Settings to configure your API keys and
                    select your model providers.
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
                    Open your terminal
                  </h5>
                  <p className="text-sm text-text-secondary m-0">
                    Launch your preferred Linux terminal emulator.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent text-xs font-bold shrink-0">
                  2
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-text-primary mt-0.5 mb-1">
                    Run the universal installer command
                  </h5>
                  <p className="text-sm text-text-secondary m-0">
                    Paste and run the following command to download and install
                    Sythoria automatically:
                  </p>
                  <TerminalSnippet code="curl -fsSL https://raw.githubusercontent.com/sythoria/sythoria-desktop/main/install.sh | bash" />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent text-xs font-bold shrink-0">
                  3
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-text-primary mt-0.5 mb-1">
                    Automatic Setup & Launch
                  </h5>
                  <p className="text-sm text-text-secondary m-0">
                    The installer detects your package manager (`apt`, `dnf`, or
                    AppImage fallback), downloads the application icon, and
                    creates a desktop menu shortcut automatically.
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
