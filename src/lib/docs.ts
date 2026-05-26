import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "src/content/docs");

export interface DocContent {
  slug: string;
  title: string;
  description: string;
  content: string;
  frontmatter: Record<string, unknown>;
}

export function getDocBySlug(slug: string): DocContent | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: (data.title as string) || slug,
    description: (data.description as string) || "",
    content,
    frontmatter: data,
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
  return walk(CONTENT_DIR);
}
