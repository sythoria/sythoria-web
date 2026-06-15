"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { docsNav, type DocNavGroup } from "@/lib/docs-nav";

function NavGroup({
  group,
  currentSlug,
}: {
  group: DocNavGroup;
  currentSlug: string;
}) {
  const hasActiveChild = group.items.some((item) => currentSlug === item.slug);
  const [open, setOpen] = useState(group.defaultOpen ?? hasActiveChild);

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-text-secondary transition-colors"
      >
        {group.title}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="space-y-0.5 mt-1">
          {group.items.map((item) => {
            const isActive = currentSlug === item.slug;
            const href = `/docs/${item.slug}`;
            return (
              <li key={item.slug}>
                <Link
                  href={href}
                  className={`block px-3 py-1.5 text-sm rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "text-accent bg-accent-soft font-medium"
                      : "text-text-secondary hover:text-text-primary hover:bg-hover"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function DocsSidebar() {
  const pathname = usePathname();
  const currentSlug = pathname.replace("/docs/", "").replace("/docs", "");

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-28 bg-surface/60 backdrop-blur-3xl border border-border/50 rounded-3xl p-5 shadow-2xl shadow-black/5 dark:shadow-black/20 max-h-[calc(100vh-8rem)] flex flex-col">
        <nav className="overflow-y-auto scrollbar-none pr-2">
          {docsNav.map((group) => (
            <NavGroup
              key={group.title}
              group={group}
              currentSlug={currentSlug}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}
