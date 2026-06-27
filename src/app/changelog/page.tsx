import { type Metadata } from "next";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import RefractiveBackground from "@/components/marketing/RefractiveBackground";
import ChangelogFeed from "@/components/marketing/ChangelogFeed";
import { getReleases } from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Changelog — Sythoria",
  description:
    "Follow the development of Sythoria. Discover new features, security updates, bug fixes, and platform downloads for the privacy-first AI desktop client.",
};

// Revalidate page at most once per hour (ISR) to stay fresh and respect GitHub API rate limits
export const revalidate = 3600;

export default async function ChangelogPage() {
  const releases = await getReleases();

  return (
    <div className="min-h-screen bg-transparent relative overflow-x-hidden">
      {/* Decorative gradient & topographic background lines */}
      <RefractiveBackground />

      {/* Floating navigation bar */}
      <Navbar />

      {/* Main Content Layout */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-32 pb-24">
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-accent-soft text-accent border border-accent/15">
            Updates Feed
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary bg-clip-text">
            Changelog
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed">
            Follow the latest releases, feature upgrades, and bug fixes for the
            Sythoria desktop app. Direct platform downloads are available for
            each version.
          </p>
        </div>

        {/* Interactive Timeline Feed */}
        <ChangelogFeed releases={releases} />
      </main>

      {/* Website Footer */}
      <Footer />
    </div>
  );
}
