import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const webRoot = process.cwd();
const factsPath = path.join(webRoot, "src", "content", "desktop-facts.json");
const facts = JSON.parse(fs.readFileSync(factsPath, "utf8"));
const desktopRoot = path.resolve(
  process.env.SYTHORIA_DESKTOP_PATH ||
    path.join(webRoot, "..", "sythoria-desktop")
);
const desktopPackagePath = path.join(desktopRoot, "package.json");

if (!fs.existsSync(desktopPackagePath)) {
  console.log(
    "Skipped desktop source parity: set SYTHORIA_DESKTOP_PATH to a sythoria-desktop checkout."
  );
  process.exit(0);
}

const errors = [];
const desktopPackage = JSON.parse(fs.readFileSync(desktopPackagePath, "utf8"));
const expectedVersion = `v${desktopPackage.version}`;

if (facts.version !== expectedVersion) {
  errors.push(
    `website version ${facts.version} does not match desktop ${expectedVersion}`
  );
}

try {
  const tagRevision = execFileSync(
    "git",
    ["-C", desktopRoot, "rev-parse", `${facts.version}^{commit}`],
    { encoding: "utf8" }
  ).trim();
  if (facts.sourceRevision !== tagRevision) {
    errors.push(
      `source revision ${facts.sourceRevision} does not match ${facts.version} tag ${tagRevision}`
    );
  }
} catch {
  errors.push(`cannot resolve the ${facts.version} tag in ${desktopRoot}`);
}

const presetsSource = fs.readFileSync(
  path.join(desktopRoot, "src", "config", "providerPresets.ts"),
  "utf8"
);
const desktopPresets = new Map(
  [
    ...presetsSource.matchAll(
      /\{\s*providerId:\s*"([^"]+)"[\s\S]*?apiBase:\s*"([^"]*)"[\s\S]*?defaultModel:\s*"([^"]*)"[\s\S]*?\}/g
    ),
  ].map(([, providerId, apiBase, defaultModel]) => [
    providerId,
    { apiBase, defaultModel },
  ])
);

for (const [providerId, websitePreset] of Object.entries(facts.providers)) {
  const desktopPreset = desktopPresets.get(providerId);
  if (!desktopPreset) {
    errors.push(`desktop preset ${providerId} is missing`);
    continue;
  }
  for (const field of ["apiBase", "defaultModel"]) {
    if (websitePreset[field] !== desktopPreset[field]) {
      errors.push(
        `${providerId}.${field} is ${websitePreset[field]} on the website and ${desktopPreset[field]} in the desktop app`
      );
    }
  }
}

const keybindSource = fs.readFileSync(
  path.join(desktopRoot, "src", "store", "useKeybindStore.ts"),
  "utf8"
);
for (const shortcut of [
  facts.shortcuts.conversationPicker,
  facts.shortcuts.commandPalette,
  facts.shortcuts.appshot,
]) {
  if (!keybindSource.includes(`defaultCombo: "${shortcut}"`)) {
    errors.push(`desktop keybind defaults do not include ${shortcut}`);
  }
}

const rustSource = fs.readFileSync(
  path.join(desktopRoot, "src-tauri", "src", "lib.rs"),
  "utf8"
);
if (
  facts.shortcuts.settingsSearch !== "Ctrl+Space" ||
  !rustSource.includes("Shortcut::new(Some(Modifiers::CONTROL), Code::Space)")
) {
  errors.push(
    "settings search shortcut does not match the native Ctrl+Space binding"
  );
}

const searchSource = fs.readFileSync(
  path.join(desktopRoot, "src-tauri", "src", "search", "mod.rs"),
  "utf8"
);
const searchProviders = ["google", "searxng", "firecrawl"];
const fetchProviders = ["firecrawl", "jina"];

if (
  JSON.stringify(facts.search.searchProviders) !==
  JSON.stringify(searchProviders)
) {
  errors.push(`website search providers must be ${searchProviders.join(", ")}`);
}
if (
  JSON.stringify(facts.search.fetchProviders) !== JSON.stringify(fetchProviders)
) {
  errors.push(`website fetch providers must be ${fetchProviders.join(", ")}`);
}
for (const provider of new Set([...searchProviders, ...fetchProviders])) {
  if (!searchSource.includes(`"${provider}"`)) {
    errors.push(`desktop search backend does not include ${provider}`);
  }
}

if (errors.length) {
  console.error(`Desktop source parity failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Validated website facts against desktop ${facts.version} at ${facts.sourceRevision.slice(0, 7)}.`
);
