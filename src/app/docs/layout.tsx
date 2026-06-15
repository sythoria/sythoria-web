import type { Metadata } from "next";
import DocsTopBar from "@/components/docs/TopBar";
import DocsSidebar from "@/components/docs/Sidebar";
import RefractiveBackground from "@/components/marketing/RefractiveBackground";

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
    <div className="min-h-screen bg-transparent relative overflow-x-hidden">
      <RefractiveBackground />
      <DocsTopBar />
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 pt-28 pb-16 flex gap-6 lg:gap-8">
        <DocsSidebar />
        <main className="flex-1 min-w-0">
          <div className="bg-surface/60 backdrop-blur-3xl border border-border/50 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-black/5 dark:shadow-black/20 prose-docs max-w-none min-h-[calc(100vh-10rem)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
