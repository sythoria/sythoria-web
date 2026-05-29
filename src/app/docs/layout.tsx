import type { Metadata } from "next";
import DocsTopBar from "@/components/docs/TopBar";
import DocsSidebar from "@/components/docs/Sidebar";

export const metadata: Metadata = {
  title: "Sythoria Docs",
  description: "Documentation for Sythoria — privacy-first AI chat interface",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-chat">
      <DocsTopBar />
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16 flex gap-8">
        <DocsSidebar />
        <main className="flex-1 min-w-0 max-w-none prose-docs">{children}</main>
      </div>
    </div>
  );
}
