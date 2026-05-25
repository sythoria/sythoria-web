import Link from "next/link";
import { BookOpen } from "lucide-react";
import DocsSearch from "./Search";

export default function DocsTopBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border/50 shadow-sm shadow-black/5">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/docs"
            className="flex items-center gap-2 text-text-primary hover:text-accent transition-colors"
          >
            <BookOpen size={18} className="text-accent" />
            <span className="text-base font-semibold tracking-tight">Sythoria Docs</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            Home
          </Link>
          <Link
            href="/chat"
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            Chat
          </Link>
        </div>
        <DocsSearch variant="full" />
      </div>
    </nav>
  );
}
