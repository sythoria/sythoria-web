import type { Metadata } from "next";
import { ExternalLink, ChevronRight, Sparkles, FileCode } from "lucide-react";
import { getReleaseFeed } from "@/lib/changelog";
import { formatBytes, formatDate } from "@/utils/formatters";
import {
  DESKTOP_DOWNLOAD_URLS,
  DESKTOP_FACTS_VERIFIED_AT,
  DESKTOP_VERSION,
  GITHUB_RELEASES_URL,
} from "@/lib/site-config";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DownloadCards from "@/components/marketing/DownloadCards";

export const metadata: Metadata = {
  title: "Download Sythoria Desktop | Official Downloads",
  description:
    "Download the latest published Sythoria Desktop release for Windows, macOS, or Linux.",
  alternates: {
    canonical: "/downloads",
  },
  openGraph: {
    title: "Download Sythoria Desktop",
    description:
      "Get Sythoria Desktop for Windows, macOS, and Linux. No Sythoria account or hosted prompt relay is required.",
  },
};

export const revalidate = 60;

export default async function DownloadsPage() {
  const feed = await getReleaseFeed();
  const latestRelease = feed.releases[0];
  const versionTag = latestRelease?.tag_name ?? DESKTOP_VERSION;
  const releaseDate = latestRelease?.published_at
    ? formatDate(latestRelease.published_at)
    : formatDate(`${DESKTOP_FACTS_VERIFIED_AT}T00:00:00Z`);
  const releaseUrl = latestRelease?.html_url ?? GITHUB_RELEASES_URL;

  // Filter assets by OS platform
  const assets = latestRelease?.assets ?? [];
  const windowsSetup = assets.find((asset) =>
    /setup.*\.exe$/i.test(asset.name)
  );
  const macDmg = assets.find((a) => a.name.toLowerCase().endsWith(".dmg"));
  return (
    <div className="min-h-screen bg-landing-bg text-text-primary selection:bg-accent/30 flex flex-col justify-between">
      <Navbar />

      {/* Background radial ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-30 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, var(--color-glow-primary), transparent 70%)",
          }}
        />
      </div>

      {/* Main Header / Hero */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-8 sm:pt-32 sm:pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-6 animate-fade-in">
          <Sparkles size={14} />
          <span>Latest published release {versionTag}</span>
          <span className="text-text-muted font-normal">· {releaseDate}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text-primary max-w-3xl mx-auto leading-tight">
          Download Sythoria Desktop
        </h1>
      </header>

      {/* Main Download Cards Grid */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pb-20 space-y-12">
        <DownloadCards
          releaseUrl={releaseUrl}
          windowsSetupUrl={windowsSetup?.browser_download_url}
          macDmgUrl={macDmg?.browser_download_url}
          linuxScriptUrl={DESKTOP_DOWNLOAD_URLS.linuxScript}
          windowsSetupSize={windowsSetup?.size}
          macDmgSize={macDmg?.size}
        />

        {feed.warning && (
          <p
            role="status"
            className="rounded-xl border border-border/40 bg-surface/30 px-4 py-3 text-sm text-text-secondary"
          >
            {feed.warning}
          </p>
        )}

        {/* PUBLISHED RELEASE ASSETS LIST */}
        <section className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary m-0 flex items-center gap-2">
                <FileCode size={22} className="text-accent" />
                Published release files ({versionTag})
              </h2>
              <p className="text-xs text-text-secondary mt-1 m-0">
                Files currently attached to the published GitHub release.
              </p>
            </div>

            <a
              href={releaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover font-semibold transition-colors shrink-0"
            >
              <span>View GitHub Release</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <Card
            variant="glass"
            padding="none"
            className="overflow-hidden border border-border/40 bg-surface/30 backdrop-blur-md"
          >
            <div className="divide-y divide-border/30">
              {assets.length === 0 ? (
                <div className="p-6 text-sm text-text-secondary">
                  This release does not have downloadable files attached yet.
                  Open the GitHub release to check its current status.
                </div>
              ) : (
                assets.map((asset) => (
                  <div
                    key={asset.name}
                    className="flex items-center justify-between p-4 hover:bg-hover/30 transition-colors"
                  >
                    <div className="min-w-0 pr-4">
                      <span className="block text-sm font-semibold text-text-primary truncate">
                        {asset.name}
                      </span>
                      <span className="text-xs text-text-muted font-mono">
                        {formatBytes(asset.size)}
                      </span>
                    </div>

                    <a
                      href={asset.browser_download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface border border-border/50 text-text-primary hover:text-accent hover:border-accent/40 transition-all shrink-0"
                    >
                      <span>Download</span>
                      <ChevronRight size={14} />
                    </a>
                  </div>
                ))
              )}
            </div>
          </Card>
        </section>

        {/* GUIDANCE & DOCUMENTATION LINK */}
        <section className="rounded-2xl border border-border/40 bg-surface/20 p-8 text-center space-y-4">
          <h3 className="text-lg font-bold text-text-primary m-0">
            Need help installing or setting up your API keys?
          </h3>
          <p className="text-sm text-text-secondary max-w-xl mx-auto m-0">
            The Quickstart covers installation, provider setup, and the first
            connection check.
          </p>
          <div>
            <Button href="/docs/getting-started" variant="secondary" size="md">
              Read Quickstart Documentation
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
