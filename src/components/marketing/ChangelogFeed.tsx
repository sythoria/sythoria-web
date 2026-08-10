"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Info,
  Rocket,
  Search,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CustomBlockquote from "@/components/docs/CustomBlockquote";
import type { GitHubRelease, ReleaseFeed } from "@/lib/changelog";
import { GITHUB_RELEASES_URL } from "@/lib/site-config";

import { formatBytes, formatDate } from "@/utils/formatters";
export { formatBytes, formatDate };

export function getAssetPlatform(filename: string): string {
  const name = filename.toLowerCase();
  if (name.endsWith(".dmg") || name.includes("aarch64.app")) return "macOS";
  if (name.endsWith(".exe") || name.endsWith(".msi") || name.endsWith(".zip")) {
    if (name.includes("setup")) return "Windows (Setup)";
    if (
      name.includes("portable") ||
      name.includes("windows") ||
      name.includes("win")
    ) {
      return "Windows (Portable)";
    }
    return "Windows";
  }
  if (
    name.endsWith(".appimage") ||
    name.endsWith(".deb") ||
    name.endsWith(".rpm")
  ) {
    return "Linux";
  }
  if (name.endsWith(".sig")) return "Signature";
  return "Release file";
}

function ReleaseNotes({ body }: { body: string }) {
  if (!body) {
    return (
      <p className="text-sm text-text-secondary">
        No release note text available for this build. Open the GitHub release
        for details.
      </p>
    );
  }

  return (
    <div className="markdown-body mt-4 text-text-secondary leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          blockquote: CustomBlockquote,
          h1: ({ children }) => (
            <h3 className="text-lg font-bold text-text-primary mt-6 mb-3">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h3 className="text-lg font-bold text-text-primary mt-6 mb-3">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="text-base font-semibold text-text-primary mt-4 mb-2">
              {children}
            </h4>
          ),
          h4: ({ children }) => (
            <h5 className="text-sm font-semibold text-text-primary mt-3 mb-1">
              {children}
            </h5>
          ),
          table: ({ children }) => (
            <div
              className="content-scroll-region my-4"
              role="region"
              aria-label="Release notes table"
              tabIndex={0}
            >
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}

type Filter = "all" | "stable" | "prerelease";

interface ChangelogFeedProps {
  feed: ReleaseFeed;
  query: string;
  filter: Filter;
}

export default function ChangelogFeed({
  feed,
  query: initialQuery,
  filter: initialFilter,
}: ChangelogFeedProps) {
  const [activeFilter, setActiveFilter] = useState<Filter>(initialFilter);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedRelease, setSelectedRelease] = useState<GitHubRelease | null>(
    null
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filtered = feed.releases.filter((release) => {
    if (activeFilter === "stable" && release.prerelease) return false;
    if (activeFilter === "prerelease" && !release.prerelease) return false;
    if (!normalizedQuery) return true;
    return [release.tag_name, release.name, release.body].some((value) =>
      value.toLowerCase().includes(normalizedQuery)
    );
  });

  // ──────────────────────────────────────────
  // VIEW 2: FULL RELEASE DETAIL VIEW (Screenshot 2)
  // ──────────────────────────────────────────
  if (selectedRelease) {
    const releaseTitle =
      selectedRelease.name || `Sythoria ${selectedRelease.tag_name}`;

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => setSelectedRelease(null)}
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors py-1"
        >
          <ArrowLeft size={16} />
          <span>Back to changelog</span>
        </button>

        {/* Header Title Section */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary flex items-center gap-3">
            <Rocket size={36} className="text-accent shrink-0" />
            <span>{releaseTitle}</span>
          </h1>

          <p className="text-lg text-text-secondary">
            The {selectedRelease.tag_name} release of Sythoria
          </p>

          <div className="flex items-center gap-3 pt-2 text-xs text-text-muted">
            <time dateTime={selectedRelease.published_at}>
              {formatDate(selectedRelease.published_at)}
            </time>
            <span className="font-mono text-[11px] bg-surface/80 border border-border/40 px-2 py-0.5 rounded-md text-text-muted">
              {selectedRelease.tag_name}
            </span>
            {selectedRelease.prerelease ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                Pre-release
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                Release
              </span>
            )}
          </div>
        </div>

        {/* What's Changed Section */}
        <div className="pt-6 border-t border-border/40 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
              <span>What&apos;s Changed</span>
              <a
                href={selectedRelease.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-accent transition-colors"
                title="Open on GitHub"
              >
                <ExternalLink size={18} />
              </a>
            </h2>
          </div>

          <ReleaseNotes body={selectedRelease.body} />
        </div>

        {/* Platform Downloads Section */}
        {selectedRelease.assets.length > 0 && (
          <div className="pt-8 border-t border-border/40 space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-text-muted">
              <Download size={16} />
              <span>Platform Downloads</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedRelease.assets.map((asset) => (
                <a
                  key={asset.name}
                  href={asset.browser_download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-border/40 bg-surface/30 p-4 transition-colors hover:bg-hover hover:border-border"
                >
                  <span className="min-w-0 pr-2">
                    <span className="block text-xs font-semibold text-accent">
                      {getAssetPlatform(asset.name)}
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-medium text-text-primary">
                      {asset.name}
                    </span>
                    {formatBytes(asset.size) && (
                      <span className="mt-0.5 block text-xs text-text-muted">
                        {formatBytes(asset.size)}
                      </span>
                    )}
                  </span>
                  <ChevronRight
                    size={16}
                    className="shrink-0 text-text-muted"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────
  // VIEW 1: TIMELINE LIST VIEW (Screenshot 1)
  // ──────────────────────────────────────────
  return (
    <div className="space-y-8">
      {feed.warning && (
        <div
          role="status"
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-text-secondary"
        >
          <strong className="text-text-primary">Release data notice:</strong>{" "}
          {feed.warning} Verified {formatDate(feed.fetchedAt)}.{" "}
          <a
            href={GITHUB_RELEASES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2"
          >
            View GitHub releases
          </a>
          .
        </div>
      )}

      {/* Filter Tabs & Search Bar (Screenshot 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        {/* Category Pills (All, Releases, Pre-releases) */}
        <div className="inline-flex items-center gap-1 p-1 bg-surface/60 border border-border/40 rounded-xl backdrop-blur-md relative select-none">
          {[
            { id: "all", label: "All" },
            { id: "stable", label: "Releases" },
            { id: "prerelease", label: "Pre-releases" },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as Filter)}
                className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors z-10 cursor-pointer ${
                  isActive
                    ? "text-text-primary font-semibold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeChangelogTab"
                    className="absolute inset-0 bg-surface-elevated rounded-lg shadow-sm border border-border/50 -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  />
                )}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search
            size={16}
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search releases..."
            className="w-full rounded-xl border border-border/40 bg-surface/40 py-1.5 pl-9 pr-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent"
          />
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {filtered.length} release{filtered.length === 1 ? "" : "s"} found.
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/40 bg-surface/30 p-12 text-center">
          <Info size={36} className="mx-auto mb-3 text-text-muted" />
          <h2 className="text-base font-semibold text-text-primary">
            No releases match your filter
          </h2>
          <p className="mx-auto mt-1 max-w-xs text-xs text-text-secondary">
            Try switching filter tabs or clearing your search.
          </p>
        </div>
      ) : (
        /* Vertical Timeline Container (Screenshot 1) */
        <div className="relative pl-7 sm:pl-8 space-y-6">
          {/* Continuous unbroken vertical timeline line */}
          <div className="absolute left-[10px] sm:left-[12px] top-3 bottom-3 w-0.5 bg-border/40 -translate-x-1/2" />

          {filtered.map((release) => {
            const title = release.name || `Sythoria ${release.tag_name}`;
            return (
              <article
                key={release.id}
                id={release.tag_name}
                className="relative scroll-mt-32 group"
              >
                {/* Timeline Node Circle Dot directly centered on the vertical line */}
                <div className="absolute -left-[18px] sm:-left-[20px] top-6 w-3.5 h-3.5 rounded-full border-2 border-neutral-400 dark:border-neutral-500 bg-background shadow-sm transition-all group-hover:scale-125 -translate-x-1/2" />

                {/* Compact Timeline Item Card (Clickable to open Detail View) */}
                <button
                  type="button"
                  onClick={() => setSelectedRelease(release)}
                  className="w-full text-left glass-panel glass-edge-hover rounded-2xl border border-border/40 p-5 sm:p-6 space-y-2.5 transition-all hover:border-text-secondary/40 cursor-pointer block"
                >
                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                    <time
                      dateTime={release.published_at}
                      className="font-medium text-text-secondary"
                    >
                      {formatDate(release.published_at)}
                    </time>

                    <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-surface/80 border border-border/40 px-2 py-0.5 rounded-md text-text-muted">
                      {release.tag_name}
                    </span>

                    {release.prerelease ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                        Pre-release
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                        Release
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary flex items-center gap-2 group-hover:text-accent transition-colors">
                    <Rocket size={18} className="text-accent shrink-0" />
                    <span>{title}</span>
                  </h2>

                  {/* Teaser Summary Line */}
                  <p className="text-sm text-text-secondary line-clamp-2">
                    The {release.tag_name} release of Sythoria Desktop Client.
                  </p>
                </button>
              </article>
            );
          })}
        </div>
      )}

      <p className="text-center text-xs text-text-muted pt-4">
        Showing releases directly from GitHub.{" "}
        <a
          href={GITHUB_RELEASES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline underline-offset-2 hover:text-accent-hover"
        >
          View full release history on GitHub
        </a>
      </p>
    </div>
  );
}
