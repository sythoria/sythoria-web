import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const docsRoot = path.join(root, "src", "content", "docs");
const navPath = path.join(root, "src", "lib", "docs-nav.ts");
const facts = JSON.parse(
  fs.readFileSync(
    path.join(root, "src", "content", "desktop-facts.json"),
    "utf8"
  )
);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function parseFrontmatter(raw, file) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: missing valid frontmatter block`);
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const index = line.indexOf(":");
    if (index < 1) continue;
    data[line.slice(0, index).trim()] = line
      .slice(index + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
  }
  return { data, body: match[2] };
}

const errors = [];
const docs = new Map();
const titleOwners = new Map();

for (const file of walk(docsRoot).filter((file) => file.endsWith(".mdx"))) {
  const relative = path.relative(docsRoot, file).replaceAll(path.sep, "/");
  const slug = relative.replace(/\.mdx$/, "");
  try {
    const raw = fs.readFileSync(file, "utf8");
    const { data, body } = parseFrontmatter(raw, relative);
    for (const field of [
      "title",
      "description",
      "lastVerifiedVersion",
      "lastVerifiedDate",
      "source",
    ]) {
      if (!data[field]) errors.push(`${relative}: missing ${field}`);
    }
    if (data.lastVerifiedVersion !== facts.version) {
      errors.push(
        `${relative}: verified version ${data.lastVerifiedVersion || "<missing>"} does not match ${facts.version}`
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.lastVerifiedDate || "")) {
      errors.push(`${relative}: lastVerifiedDate must be YYYY-MM-DD`);
    }
    const bodyWithoutFences = body.replace(/```[\s\S]*?```/g, "");
    if (!body.trimStart().startsWith("# ")) {
      errors.push(`${relative}: content must start with one H1`);
    }
    const h1Count = (bodyWithoutFences.match(/^# /gm) || []).length;
    if (h1Count !== 1)
      errors.push(`${relative}: expected one H1, found ${h1Count}`);

    let inFence = false;
    body.split(/\r?\n/).forEach((line, index) => {
      if (!line.startsWith("```")) return;
      if (!inFence && line.trim() === "```") {
        errors.push(`${relative}:${index + 1}: code fence needs a language`);
      }
      inFence = !inFence;
    });

    const priorOwner = titleOwners.get(data.title);
    if (priorOwner) {
      errors.push(`${relative}: duplicate title also used by ${priorOwner}`);
    }
    titleOwners.set(data.title, relative);
    docs.set(slug, { relative, raw, body, data });
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
}

const navSource = fs.readFileSync(navPath, "utf8");
const navSlugs = new Set(
  [...navSource.matchAll(/slug:\s*["']([^"']+)["']/g)].map((match) => match[1])
);

for (const slug of docs.keys()) {
  if (!navSlugs.has(slug))
    errors.push(`${slug}: documentation file is not in nav`);
}
for (const slug of navSlugs) {
  if (!docs.has(slug))
    errors.push(`${slug}: nav entry has no documentation file`);
}

for (const [slug, doc] of docs) {
  for (const match of doc.body.matchAll(/\]\(\/docs\/([^#)]+)(?:#[^)]+)?\)/g)) {
    if (!docs.has(match[1])) {
      errors.push(`${doc.relative}: broken internal docs link to ${match[1]}`);
    }
  }

  const forbidden = [
    [/OLLAMA_ORIGINS\s*=\s*["']?\*/i, "wildcard Ollama origin"],
    [/git checkout -- \.($|\s)/im, "destructive Git checkout example"],
    [/xattr\s+-d\s+com\.apple\.quarantine/i, "quarantine bypass"],
    [/use a proxy\/VPN/i, "regional-circumvention advice"],
    [/encrypted SQLite/i, "unsupported SQLite claim"],
    [/safeStorage/i, "Electron safeStorage claim"],
    [/CUDA\s*12\.1/i, "unsupported CUDA requirement"],
    [
      /writes? (?:errors? )?to (?:a )?rotating (?:disk )?log/i,
      "unsupported rotating-log claim",
    ],
  ];
  for (const [pattern, label] of forbidden) {
    if (pattern.test(doc.body))
      errors.push(`${doc.relative}: contains ${label}`);
  }
}

const providerPages = {
  openai: "providers/openai",
  gemini: "providers/gemini",
  anthropic: "providers/anthropic",
  ollama: "providers/ollama",
  nim: "providers/nvidia-nim",
  openrouter: "providers/openrouter",
};
for (const [provider, slug] of Object.entries(providerPages)) {
  const page = docs.get(slug);
  const preset = facts.providers[provider];
  if (!page) continue;
  for (const value of [preset.apiBase, preset.defaultModel]) {
    if (!page.body.includes(value)) {
      errors.push(`${page.relative}: missing desktop preset value ${value}`);
    }
  }
}

if (errors.length) {
  console.error(`Content validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Validated ${docs.size} documentation pages against desktop ${facts.version}.`
);
