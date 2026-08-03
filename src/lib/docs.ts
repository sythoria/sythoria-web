import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "src/content/docs");

export interface DocContent {
  slug: string;
  title: string;
  description: string;
  content: string;
  frontmatter: Record<string, unknown>;
  lastVerifiedVersion: string;
  lastVerifiedDate: string;
  source: string;
}

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { data: {}, content: raw };
  }
  const yamlContent = match[1];
  const content = match[2];

  const data: Record<string, string> = {};
  const lines = yamlContent.split(/\r?\n/);
  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      // Remove surrounding quotes if any
      data[key] = value.replace(/^['"]|['"]$/g, "");
    }
  }
  return { data, content };
}

export function getDocBySlug(slug: string): DocContent | null {
  if (!slug || slug.split("/").some((part) => !/^[a-z0-9-]+$/.test(part))) {
    return null;
  }

  const contentRoot = path.resolve(CONTENT_DIR);
  const filePath = path.resolve(contentRoot, `${slug}.mdx`);
  const normalizedRoot = `${contentRoot.toLowerCase()}${path.sep}`;
  if (!filePath.toLowerCase().startsWith(normalizedRoot)) return null;
  if (!fs.existsSync(filePath)) return null;

  const realPath = fs.realpathSync(filePath);
  if (!realPath.toLowerCase().startsWith(normalizedRoot)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = parseFrontmatter(raw);

  return {
    slug,
    title: (data.title as string) || slug,
    description: (data.description as string) || "",
    content,
    frontmatter: data,
    lastVerifiedVersion: (data.lastVerifiedVersion as string) || "",
    lastVerifiedDate: (data.lastVerifiedDate as string) || "",
    source: (data.source as string) || "",
  };
}

export function getAllDocs(): DocContent[] {
  function walk(dir: string, prefix = ""): DocContent[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const docs: DocContent[] = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        docs.push(
          ...walk(
            path.join(dir, entry.name),
            prefix ? `${prefix}/${entry.name}` : entry.name
          )
        );
      } else if (entry.name.endsWith(".mdx")) {
        const slug = prefix
          ? `${prefix}/${entry.name.replace(/\.mdx$/, "")}`
          : entry.name.replace(/\.mdx$/, "");
        const doc = getDocBySlug(slug);
        if (doc) docs.push(doc);
      }
    }
    return docs;
  }

  if (!fs.existsSync(CONTENT_DIR)) return [];
  return walk(CONTENT_DIR).sort((a, b) => a.slug.localeCompare(b.slug));
}
