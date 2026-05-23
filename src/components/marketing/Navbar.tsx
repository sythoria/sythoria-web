import { MessageSquare } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-text-primary hover:text-accent transition-colors">
          <MessageSquare size={20} className="text-accent" />
          <span className="text-base font-semibold tracking-tight">Sythoria</span>
        </Link>
        <div className="flex items-center gap-4">
        <Link
          href="/chat"
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Chat
        </Link>
        <Link
            href="/chat"
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
          >
            Try it out
          </Link>
        </div>
      </div>
    </nav>
  );
}
