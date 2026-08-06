import "server-only";

import {
  DESKTOP_FACTS_VERIFIED_AT,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_REPOSITORY_URL,
} from "@/lib/site-config";

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
  download_count: number;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  published_at: string;
  body: string;
  html_url: string;
  prerelease: boolean;
  draft: boolean;
  assets: ReleaseAsset[];
}

export interface ReleaseFeed {
  releases: GitHubRelease[];
  source: "github" | "verified-snapshot";
  fetchedAt: string;
  warning: string | null;
}

const VERIFIED_RELEASE_SNAPSHOT: GitHubRelease[] = [
  {
    id: 365971416,
    tag_name: "v0.4.3",
    name: "Sythoria v0.4.3",
    published_at: "2026-08-06T05:41:54Z",
    prerelease: false,
    draft: false,
    html_url: `${GITHUB_REPOSITORY_URL}/releases/tag/v0.4.3`,
    body: "",
    assets: [
      {
        name: "Sythoria_0.4.3_aarch64.dmg",
        browser_download_url: `${GITHUB_REPOSITORY_URL}/releases/download/v0.4.3/Sythoria_0.4.3_aarch64.dmg`,
        size: 14_047_022,
        download_count: 0,
      },
      {
        name: "Sythoria_0.4.3_amd64.AppImage",
        browser_download_url: `${GITHUB_REPOSITORY_URL}/releases/download/v0.4.3/Sythoria_0.4.3_amd64.AppImage`,
        size: 89_561_592,
        download_count: 0,
      },
      {
        name: "Sythoria_0.4.3_x64-setup.exe",
        browser_download_url: `${GITHUB_REPOSITORY_URL}/releases/download/v0.4.3/Sythoria_0.4.3_x64-setup.exe`,
        size: 12_087_731,
        download_count: 0,
      },
      {
        name: "sythoria_windows_x64.exe",
        browser_download_url: `${GITHUB_REPOSITORY_URL}/releases/download/v0.4.3/sythoria_windows_x64.exe`,
        size: 24_192_512,
        download_count: 0,
      },
    ],
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSafeGitHubUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "github.com";
  } catch {
    return false;
  }
}

function parseAsset(value: unknown): ReleaseAsset | null {
  if (!isRecord(value)) return null;
  const {
    name,
    browser_download_url: downloadUrl,
    size,
    download_count,
  } = value;

  if (
    typeof name !== "string" ||
    name.length === 0 ||
    name.length > 255 ||
    !isSafeGitHubUrl(downloadUrl) ||
    typeof size !== "number" ||
    !Number.isFinite(size) ||
    size < 0 ||
    typeof download_count !== "number" ||
    !Number.isFinite(download_count) ||
    download_count < 0
  ) {
    return null;
  }

  return {
    name,
    browser_download_url: downloadUrl,
    size,
    download_count,
  };
}

function parseRelease(value: unknown): GitHubRelease | null {
  if (!isRecord(value)) return null;
  const {
    id,
    tag_name: tagName,
    name,
    published_at: publishedAt,
    body,
    html_url: htmlUrl,
    prerelease,
    draft,
    assets,
  } = value;

  if (
    typeof id !== "number" ||
    !Number.isSafeInteger(id) ||
    typeof tagName !== "string" ||
    !/^v?[0-9][0-9A-Za-z._-]{0,63}$/.test(tagName) ||
    typeof name !== "string" ||
    name.length > 255 ||
    typeof publishedAt !== "string" ||
    Number.isNaN(Date.parse(publishedAt)) ||
    typeof body !== "string" ||
    !isSafeGitHubUrl(htmlUrl) ||
    typeof prerelease !== "boolean" ||
    typeof draft !== "boolean" ||
    !Array.isArray(assets)
  ) {
    return null;
  }

  const parsedAssets = assets
    .slice(0, 30)
    .map(parseAsset)
    .filter((asset): asset is ReleaseAsset => asset !== null);

  return {
    id,
    tag_name: tagName,
    name: name || tagName,
    published_at: publishedAt,
    body: body.slice(0, 100_000),
    html_url: htmlUrl,
    prerelease,
    draft,
    assets: parsedAssets,
  };
}

function snapshotFeed(reason: string): ReleaseFeed {
  return {
    releases: VERIFIED_RELEASE_SNAPSHOT,
    source: "verified-snapshot",
    fetchedAt: `${DESKTOP_FACTS_VERIFIED_AT}T00:00:00Z`,
    warning: reason,
  };
}

export async function getReleaseFeed(): Promise<ReleaseFeed> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Sythoria-Web",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases?per_page=10`,
      { next: { revalidate: 3600 }, headers }
    );

    if (!response.ok) {
      console.warn(`GitHub releases request failed with ${response.status}.`);
      return snapshotFeed(
        "GitHub release data is temporarily unavailable. Showing the last verified stable release."
      );
    }

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) {
      return snapshotFeed(
        "GitHub returned an unexpected response. Showing the last verified stable release."
      );
    }

    const releases = payload
      .slice(0, 10)
      .map(parseRelease)
      .filter(
        (release): release is GitHubRelease =>
          release !== null && !release.draft
      );

    if (releases.length === 0) {
      return snapshotFeed(
        "No valid GitHub releases were returned. Showing the last verified stable release."
      );
    }

    return {
      releases,
      source: "github",
      fetchedAt: new Date().toISOString(),
      warning: null,
    };
  } catch (error) {
    console.error("Failed to load GitHub releases.", error);
    return snapshotFeed(
      "GitHub release data is temporarily unavailable. Showing the last verified stable release."
    );
  }
}

export async function getLatestVersion(): Promise<string | null> {
  const { releases } = await getReleaseFeed();
  return releases.find((release) => !release.prerelease)?.tag_name ?? null;
}
