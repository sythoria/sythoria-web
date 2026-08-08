import desktopFacts from "@/content/desktop-facts.json";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://sythoria.com";

export const GITHUB_OWNER = "sythoria";
export const GITHUB_REPO = "sythoria-desktop";
export const GITHUB_REPOSITORY_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`;
export const GITHUB_RELEASES_URL = `${GITHUB_REPOSITORY_URL}/releases`;
export const GITHUB_LATEST_RELEASE_URL = `${GITHUB_RELEASES_URL}/latest`;

export const DESKTOP_FACTS = desktopFacts;
export const DESKTOP_VERSION = desktopFacts.version;
export const DESKTOP_SOURCE_REVISION = desktopFacts.sourceRevision;
export const DESKTOP_FACTS_VERIFIED_AT = desktopFacts.verifiedAt;
export const DESKTOP_PLATFORMS = desktopFacts.platforms;
export const DESKTOP_SHORTCUTS = desktopFacts.shortcuts;
export const PROVIDER_PRESETS = desktopFacts.providers;

export const DESKTOP_DOWNLOAD_URLS = {
  windowsSetup: `${GITHUB_REPOSITORY_URL}/releases/download/${DESKTOP_VERSION}/Sythoria_${DESKTOP_VERSION.replace(/^v/, "")}_x64-setup.exe`,
  macDmg: `${GITHUB_REPOSITORY_URL}/releases/download/${DESKTOP_VERSION}/Sythoria_${DESKTOP_VERSION.replace(/^v/, "")}_aarch64.dmg`,
  linuxScript: `https://raw.githubusercontent.com/sythoria/sythoria-desktop/main/install.sh`,
};
