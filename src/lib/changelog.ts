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

export const FALLBACK_RELEASES: GitHubRelease[] = [
  {
    id: 1,
    tag_name: "v1.2.0",
    name: "v1.2.0: Multi-Provider Chat & Performance Leap",
    published_at: "2026-06-25T14:30:00Z",
    prerelease: false,
    draft: false,
    html_url:
      "https://github.com/sythoria/sythoria-desktop/releases/tag/v1.2.0",
    body: `## What's New

We are thrilled to release Sythoria v1.2.0! This release brings full multi-provider support, allowing you to connect to Ollama, OpenAI, Anthropic, Gemini, and custom endpoints seamlessly.

### Features
- **Multi-Provider Support**: Seamless setup for OpenAI, Anthropic, Gemini, NVIDIA NIM, and local Ollama.
- **Improved Performance**: Reduced startup delay by 40% and improved chat streaming responsiveness.
- **Enhanced Privacy**: Local stateless execution. API keys never leave your machine.

### Bug Fixes
- Fixed theme toggling layout shift on slower screens.
- Corrected streaming completion truncation issues on longer text responses.
`,
    assets: [
      {
        name: "Sythoria-1.2.0.dmg",
        browser_download_url:
          "https://github.com/sythoria/sythoria-desktop/releases/download/v1.2.0/Sythoria-1.2.0.dmg",
        size: 82431920,
        download_count: 312,
      },
      {
        name: "Sythoria-1.2.0.exe",
        browser_download_url:
          "https://github.com/sythoria/sythoria-desktop/releases/download/v1.2.0/Sythoria-1.2.0.exe",
        size: 94832104,
        download_count: 521,
      },
      {
        name: "Sythoria-1.2.0.AppImage",
        browser_download_url:
          "https://github.com/sythoria/sythoria-desktop/releases/download/v1.2.0/Sythoria-1.2.0.AppImage",
        size: 104857600,
        download_count: 142,
      },
    ],
  },
  {
    id: 2,
    tag_name: "v1.1.0-beta",
    name: "v1.1.0-beta: Streaming Chat & Glassmorphic UI Refinements",
    published_at: "2026-05-18T10:15:00Z",
    prerelease: true,
    draft: false,
    html_url:
      "https://github.com/sythoria/sythoria-desktop/releases/tag/v1.1.0-beta",
    body: `## Beta Release

This is a pre-release version of Sythoria featuring our brand new canvas-based particle spheres and fluid layout transitions.

### Key Additions
- **Real-Time Streaming**: Highly optimized token streaming for OpenAI and Anthropic APIs.
- **Glassmorphic UI**: Upgraded all layout panels to support a custom glassmorphism style sheet with radial glow backdrops.

> [!WARNING]
> This is a beta release. You might experience minor layout issues on mobile devices or custom resolution configurations. Please report bugs to the GitHub Issues tracker.
`,
    assets: [
      {
        name: "Sythoria-1.1.0-beta.dmg",
        browser_download_url:
          "https://github.com/sythoria/sythoria-desktop/releases/download/v1.1.0-beta/Sythoria-1.1.0-beta.dmg",
        size: 82431900,
        download_count: 45,
      },
      {
        name: "Sythoria-1.1.0-beta.exe",
        browser_download_url:
          "https://github.com/sythoria/sythoria-desktop/releases/download/v1.1.0-beta/Sythoria-1.1.0-beta.exe",
        size: 94832000,
        download_count: 89,
      },
    ],
  },
];

export const GITHUB_OWNER =
  process.env.GITHUB_OWNER ||
  process.env.NEXT_PUBLIC_GITHUB_OWNER ||
  "sythoria";

export const GITHUB_REPO =
  process.env.GITHUB_REPO ||
  process.env.NEXT_PUBLIC_GITHUB_REPO ||
  "sythoria-desktop";

export async function getReleases(): Promise<GitHubRelease[]> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "Sythoria-Web-App",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (process.env.GH_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GH_TOKEN}`;
    }
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`,
      {
        next: { revalidate: 3600 },
        headers,
      }
    );
    if (!res.ok) {
      console.warn(
        `GitHub API releases fetch failed with status: ${res.status}. Using fallback releases.`
      );
      return FALLBACK_RELEASES;
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      console.warn(
        "GitHub API releases response is not an array. Using fallback releases."
      );
      return FALLBACK_RELEASES;
    }
    // Filter out drafts
    const releases = data.filter((r: unknown) => {
      const release = r as GitHubRelease;
      return release && !release.draft;
    }) as GitHubRelease[];
    if (releases.length === 0) {
      return FALLBACK_RELEASES;
    }
    return releases;
  } catch (error) {
    console.error(
      "Failed to fetch releases from GitHub API. Using fallback releases.",
      error
    );
    return FALLBACK_RELEASES;
  }
}
