export interface DocNavItem {
  label: string;
  slug: string;
  icon?: string;
}

export interface DocNavGroup {
  title: string;
  items: DocNavItem[];
  defaultOpen?: boolean;
}

export const docsNav: DocNavGroup[] = [
  {
    title: "Getting Started",
    defaultOpen: true,
    items: [
      { label: "Quickstart", slug: "getting-started" },
    ],
  },
  {
    title: "Features",
    defaultOpen: true,
    items: [
      { label: "Streaming Responses", slug: "features/streaming" },
      { label: "Multi-Provider Chat", slug: "features/multi-provider" },
    ],
  },
  {
    title: "Providers",
    defaultOpen: false,
    items: [
      { label: "OpenAI", slug: "providers/openai" },
      { label: "Anthropic", slug: "providers/anthropic" },
      { label: "Google Gemini", slug: "providers/gemini" },
      { label: "Ollama (Local)", slug: "providers/ollama" },
      { label: "OpenRouter", slug: "providers/openrouter" },
      { label: "NVIDIA NIM", slug: "providers/nvidia-nim" },
    ],
  },
  {
    title: "Configuration",
    defaultOpen: false,
    items: [
      { label: "Settings", slug: "configuration" },
    ],
  },
  {
    title: "Privacy & Security",
    defaultOpen: false,
    items: [
      { label: "Privacy", slug: "privacy" },
    ],
  },
];

export function getAllDocSlugs(): string[] {
  return docsNav.flatMap((group) => group.items.map((item) => item.slug));
}

export function getDocMeta(slug: string): { label: string; group: string } | null {
  for (const group of docsNav) {
    const item = group.items.find((i) => i.slug === slug);
    if (item) return { label: item.label, group: group.title };
  }
  return null;
}

export function getAdjacentDocs(slug: string): { prev: DocNavItem | null; next: DocNavItem | null } {
  const all = docsNav.flatMap((g) => g.items);
  const idx = all.findIndex((i) => i.slug === slug);
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}
