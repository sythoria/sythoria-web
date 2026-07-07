"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  Download,
  ExternalLink,
  Tag,
  Calendar,
  Info,
  ChevronRight,
  FileDown,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import CustomBlockquote from "@/components/docs/CustomBlockquote";
import { Card, Badge } from "@/components/ui";
import { type GitHubRelease } from "@/lib/changelog";

// Helper to format bytes to MB/KB
function formatBytes(bytes: number, decimals = 1) {
  if (!bytes || bytes === 0) return "";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// Helper to format date
function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

// Escapes special regex characters in a query string
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Component to render text with highlighted matching substring
function HighlightedText({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) {
  if (!text) return null;
  if (!highlight.trim()) return <>{text}</>;

  const regex = new RegExp(`(${escapeRegExp(highlight)})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-accent/20 text-accent font-semibold px-0.5 rounded border border-accent/10"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

// Extracts a snippet of text surrounding the first match of the search query
function getMatchSnippet(body: string, query: string): string {
  if (!body || !query.trim()) return "";
  const index = body.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return "";

  const start = Math.max(0, index - 25);
  const end = Math.min(body.length, index + query.length + 35);
  let snippet = body.slice(start, end).replace(/\s+/g, " ");

  if (start > 0) snippet = "..." + snippet;
  if (end < body.length) snippet = snippet + "...";

  return snippet;
}

// Helper to check file extension and return platform label/icon indicators
function getAssetPlatform(filename: string): {
  label: string;
  bg: string;
  text: string;
} {
  const name = filename.toLowerCase();
  if (
    name.endsWith(".dmg") ||
    name.endsWith(".pkg") ||
    name.includes("mac") ||
    name.includes("macos")
  ) {
    return {
      label: "macOS",
      bg: "bg-white/5 border-white/10 hover:bg-white/10",
      text: "text-text-primary",
    };
  }
  if (
    name.endsWith(".exe") ||
    name.endsWith(".msi") ||
    name.includes("win") ||
    name.includes("windows")
  ) {
    return {
      label: "Windows",
      bg: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15",
      text: "text-blue-400",
    };
  }
  if (
    name.endsWith(".appimage") ||
    name.endsWith(".deb") ||
    name.endsWith(".rpm") ||
    name.endsWith(".tar.gz") ||
    name.includes("linux")
  ) {
    return {
      label: "Linux",
      bg: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15",
      text: "text-amber-400",
    };
  }
  return {
    label: "Other",
    bg: "bg-surface/40 border-border/50 hover:bg-hover",
    text: "text-text-secondary",
  };
}

export default function ChangelogFeed({
  releases,
}: {
  releases: GitHubRelease[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "stable" | "prerelease">(
    "all"
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on Escape press
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Computed: releases filtered by selected tab (stable vs pre-release)
  const filteredByTab = useMemo(() => {
    return releases.filter((release) => {
      if (filterType === "stable" && release.prerelease) return false;
      if (filterType === "prerelease" && !release.prerelease) return false;
      return true;
    });
  }, [releases, filterType]);

  // Computed: search autocomplete suggestions (computed from the filtered tab array)
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();

    return filteredByTab
      .map((release) => {
        const title = release.name || release.tag_name;
        const tag = release.tag_name;
        const body = release.body || "";

        const matchesTitle =
          title.toLowerCase().includes(query) ||
          tag.toLowerCase().includes(query);
        const snippet = getMatchSnippet(body, query);

        if (matchesTitle || snippet) {
          return {
            tag_name: tag,
            name: title,
            snippet: matchesTitle ? "" : snippet,
          };
        }
        return null;
      })
      .filter(Boolean)
      .slice(0, 5) as Array<{
      tag_name: string;
      name: string;
      snippet: string;
    }>;
  }, [filteredByTab, searchQuery]);

  // Computed: active release list showing on timeline. If a query is entered, we filter
  const timelineReleases = useMemo(() => {
    if (!searchQuery.trim()) return filteredByTab;

    const query = searchQuery.toLowerCase();

    return filteredByTab.filter((release) => {
      const matchTag = release.tag_name.toLowerCase().includes(query);
      const matchName = release.name?.toLowerCase().includes(query);
      const matchBody = release.body?.toLowerCase().includes(query);
      return matchTag || matchName || matchBody;
    });
  }, [filteredByTab, searchQuery]);

  // Scroll to selected release and flash highlight
  const handleSelectRelease = (tag: string) => {
    setDropdownOpen(false);
    setSearchQuery(""); // Clear search to display all timeline releases

    // Delay slightly to allow the DOM to render fully in case it was filtered out
    setTimeout(() => {
      const element = document.getElementById(tag);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        setActiveHighlight(tag);

        // Remove highlight after 2.5 seconds
        setTimeout(() => {
          setActiveHighlight(null);
        }, 2500);
      }
    }, 100);
  };

  return (
    <div className="space-y-12">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface/40 backdrop-blur-md p-4 rounded-2xl border border-border/50 shadow-md relative z-30">
        {/* Search input with suggestions dropdown wrapper */}
        <div ref={searchContainerRef} className="relative w-full sm:max-w-md">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => {
              if (searchQuery.trim()) setDropdownOpen(true);
            }}
            placeholder="Search updates (e.g. 'Ollama', 'v1.2.0')"
            className="w-full pl-10 pr-10 py-2.5 text-sm text-text-primary placeholder:text-text-muted bg-surface/50 border border-border/50 hover:border-border focus:border-accent rounded-xl outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setDropdownOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-hover transition-colors"
            >
              <X size={14} />
            </button>
          )}

          {/* Autocomplete Suggestions Dropdown */}
          {dropdownOpen && searchSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-surface/95 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto z-50 animate-fade-in-up">
              <div className="px-4 py-2 border-b border-border/40 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Quick Results
              </div>
              <ul className="divide-y divide-border/30">
                {searchSuggestions.map((item) => (
                  <li key={item.tag_name}>
                    <button
                      onClick={() => handleSelectRelease(item.tag_name)}
                      className="w-full text-left px-4 py-3 hover:bg-hover/80 transition-colors flex flex-col gap-1.5"
                    >
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-sm font-bold text-text-primary truncate">
                          <HighlightedText
                            text={item.name}
                            highlight={searchQuery}
                          />
                        </span>
                        <Badge
                          variant="default"
                          className="font-mono text-[9px] shrink-0 py-0.5 px-2"
                        >
                          {item.tag_name}
                        </Badge>
                      </div>
                      {item.snippet && (
                        <div className="text-xs text-text-secondary line-clamp-1 italic font-light">
                          Match:{" "}
                          <HighlightedText
                            text={item.snippet}
                            highlight={searchQuery}
                          />
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {dropdownOpen &&
            searchQuery.trim() &&
            searchSuggestions.length === 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-surface/95 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl py-6 text-center text-xs text-text-muted z-50">
                No quick matches found
              </div>
            )}
        </div>

        {/* Tab Filters */}
        <div className="flex bg-surface/60 border border-border/50 p-1 rounded-xl w-full sm:w-auto relative z-10">
          {(["all", "stable", "prerelease"] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setFilterType(type);
                setSearchQuery(""); // Clear search when switching tabs
                setDropdownOpen(false);
              }}
              className={`relative flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors duration-200 z-10 ${
                filterType === type
                  ? "text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <span className="relative z-10">
                {type === "prerelease" ? "Pre-releases" : type}
              </span>
              {filterType === type && (
                <motion.div
                  layoutId="changelogTabIndicator"
                  className="absolute inset-0 bg-accent rounded-lg shadow-md shadow-accent/15 z-0"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {timelineReleases.length === 0 ? (
        <Card variant="glass" className="py-16 text-center animate-fade-in">
          <Info
            size={40}
            className="mx-auto text-text-muted mb-4 animate-pulse"
          />
          <h3 className="text-lg font-semibold text-text-primary">
            No updates found
          </h3>
          <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
            Try adjusting your search query or filters to discover previous
            releases.
          </p>
        </Card>
      ) : (
        /* Timeline Feed */
        <div className="relative border-l border-border/60 ml-3 md:ml-0 md:border-l-0 space-y-16 relative z-10">
          {timelineReleases.map((release) => {
            const isPrerelease = release.prerelease;
            const isHighlighted = activeHighlight === release.tag_name;

            return (
              <div
                key={release.id}
                id={release.tag_name}
                className={`relative grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 group transition-all duration-700 ${
                  isHighlighted ? "brightness-[1.07]" : ""
                }`}
              >
                {/* Timeline node marker */}
                <div className="absolute left-[-17px] top-[18px] w-8 h-8 rounded-full border border-border/80 bg-surface/90 backdrop-blur shadow-sm hidden md:flex items-center justify-center z-10 transition-transform group-hover:scale-110 group-hover:border-accent/50 md:left-[23.5%]">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${isPrerelease ? "bg-amber-400" : "bg-accent animate-pulse"}`}
                  />
                </div>

                {/* Left Side: Version Meta Info */}
                <div className="pl-6 md:pl-0 md:col-span-1 md:text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 pt-2">
                  <div className="space-y-1">
                    <div className="flex items-center md:justify-end gap-2">
                      <Tag size={14} className="text-text-muted" />
                      <span className="font-mono text-base font-bold text-text-primary tracking-tight">
                        <HighlightedText
                          text={release.tag_name}
                          highlight={searchQuery}
                        />
                      </span>
                    </div>
                    <div className="flex items-center md:justify-end gap-1.5 text-xs text-text-muted">
                      <Calendar size={12} />
                      <span>{formatDate(release.published_at)}</span>
                    </div>
                  </div>

                  <div className="mt-1">
                    {isPrerelease ? (
                      <Badge variant="warning" dot>
                        Pre-release
                      </Badge>
                    ) : (
                      <Badge variant="success">Stable</Badge>
                    )}
                  </div>
                </div>

                {/* Right Side: Content Card (Flashes if scroll-focused) */}
                <div
                  className={`pl-6 md:pl-0 md:col-span-3 transition-all duration-500 ${
                    isHighlighted
                      ? "ring-2 ring-accent ring-offset-4 ring-offset-background dark:ring-offset-landing-bg rounded-2xl scale-[1.01] shadow-2xl shadow-accent/20"
                      : ""
                  }`}
                >
                  <Card
                    variant="glass"
                    glow
                    hover
                    padding="lg"
                    className="border-border/40 h-full"
                  >
                    <div className="flex flex-col gap-4">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/30 pb-4">
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary hover:text-accent transition-colors">
                          <a
                            href={release.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2"
                          >
                            <HighlightedText
                              text={release.name || release.tag_name}
                              highlight={searchQuery}
                            />
                            <ExternalLink
                              size={16}
                              className="opacity-0 group-hover:opacity-60 transition-opacity"
                            />
                          </a>
                        </h2>
                      </div>

                      {/* Markdown Release Notes */}
                      <div className="markdown-body mt-2 text-text-secondary leading-relaxed">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            blockquote: CustomBlockquote,
                          }}
                        >
                          {release.body ||
                            "*No release notes description provided.*"}
                        </ReactMarkdown>
                      </div>

                      {/* Downloads Section */}
                      {release.assets && release.assets.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-border/30">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
                            <Download size={12} />
                            Available Assets ({release.assets.length})
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {release.assets.map((asset) => {
                              const platform = getAssetPlatform(asset.name);
                              return (
                                <a
                                  key={asset.name}
                                  href={asset.browser_download_url}
                                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${platform.bg}`}
                                >
                                  <div className="min-w-0 flex-1 pr-2">
                                    <div
                                      className={`text-xs font-semibold ${platform.text}`}
                                    >
                                      {platform.label}
                                    </div>
                                    <div
                                      className="text-xs text-text-primary font-medium truncate mt-0.5"
                                      title={asset.name}
                                    >
                                      <HighlightedText
                                        text={asset.name}
                                        highlight={searchQuery}
                                      />
                                    </div>
                                    <div className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1.5">
                                      {formatBytes(asset.size) && (
                                        <span>{formatBytes(asset.size)}</span>
                                      )}
                                      {asset.download_count > 0 && (
                                        <>
                                          <span className="w-1 h-1 rounded-full bg-border" />
                                          <span className="flex items-center gap-0.5">
                                            <FileDown size={10} />
                                            {asset.download_count} downloads
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <ChevronRight
                                    size={14}
                                    className="text-text-muted shrink-0"
                                  />
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
