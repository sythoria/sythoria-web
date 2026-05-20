import { MessageSquare } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-text-muted text-sm">
          <MessageSquare size={16} className="text-accent" />
          <span>Sythoria</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/chat" className="text-sm text-text-muted hover:text-text-primary transition-colors">
            Chat
          </Link>
          <Link href="/settings" className="text-sm text-text-muted hover:text-text-primary transition-colors">
            Settings
          </Link>
        </div>
        <p className="text-xs text-text-muted">&copy; {new Date().getFullYear()} Sythoria. Privacy-first AI.</p>
      </div>
    </footer>
  );
}
