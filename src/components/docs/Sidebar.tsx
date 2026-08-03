"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { docsNav, type DocNavGroup } from "@/lib/docs-nav";

function NavGroup({
  group,
  currentSlug,
  onItemClick,
}: {
  group: DocNavGroup;
  currentSlug: string;
  onItemClick?: () => void;
}) {
  const hasActiveChild = group.items.some((item) => currentSlug === item.slug);
  const [open, setOpen] = useState(group.defaultOpen ?? hasActiveChild);
  const listId = useId();

  const expanded = hasActiveChild || open;

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen(!expanded)}
        aria-expanded={expanded}
        aria-controls={listId}
        className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:text-text-secondary"
      >
        {group.title}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded && (
        <ul id={listId} className="mt-1 space-y-0.5">
          {group.items.map((item) => {
            const isActive = currentSlug === item.slug;
            const href = `/docs/${item.slug}`;
            return (
              <li key={item.slug}>
                <Link
                  href={href}
                  prefetch={false}
                  onClick={onItemClick}
                  aria-current={isActive ? "page" : undefined}
                  className={`block rounded-lg px-3 py-1.5 text-sm transition-colors duration-200 ${
                    isActive
                      ? "text-accent-hover dark:text-accent-hover bg-accent-soft/80 dark:bg-accent-soft/30 font-semibold"
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

export default function DocsSidebar({
  onItemClick,
  minimal = false,
}: {
  onItemClick?: () => void;
  minimal?: boolean;
}) {
  const pathname = usePathname();
  const currentSlug = pathname.replace("/docs/", "").replace("/docs", "");

  const navContent = (
    <nav
      aria-label="Documentation sections"
      className="overflow-y-auto scrollbar-none pr-2"
    >
      {docsNav.map((group) => (
        <NavGroup
          key={group.title}
          group={group}
          currentSlug={currentSlug}
          onItemClick={onItemClick}
        />
      ))}
    </nav>
  );

  if (minimal) {
    return navContent;
  }

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-28 bg-surface/60 backdrop-blur-3xl border border-border/50 rounded-3xl p-5 shadow-2xl shadow-black/5 dark:shadow-black/20 max-h-[calc(100vh-8rem)] flex flex-col">
        {navContent}
      </div>
    </aside>
  );
}
