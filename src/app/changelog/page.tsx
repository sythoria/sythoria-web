import { type Metadata } from "next";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import RefractiveBackground from "@/components/marketing/RefractiveBackground";
import ChangelogFeed from "@/components/marketing/ChangelogFeed";
import { getReleaseFeed } from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Follow the development of Sythoria. Discover new features, security updates, bug fixes, and platform downloads for the privacy-first AI desktop client.",
  alternates: { canonical: "/changelog" },
};

// Revalidate page at most once per hour (ISR) to stay fresh and respect GitHub API rate limits
export const revalidate = 3600;

export default async function ChangelogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const [feed, params] = await Promise.all([getReleaseFeed(), searchParams]);
  const query = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const filter =
    params.type === "stable" || params.type === "prerelease"
      ? params.type
      : "all";

  return (
    <div className="min-h-screen bg-transparent relative overflow-x-hidden">
      {/* Decorative gradient & topographic background lines */}
      <RefractiveBackground />

      {/* Floating navigation bar */}
      <Navbar />

      {/* Main Content Layout */}
      <main
        id="main-content"
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-32 pb-24"
      >
        {/* Header Block */}
        <div className="max-w-4xl mx-auto mb-10 space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
            Changelog
          </h1>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            Release notes and updates for Sythoria.
          </p>
        </div>

        {/* Interactive Timeline Feed */}
        <ChangelogFeed feed={feed} query={query} filter={filter} />
      </main>

      {/* Website Footer */}
      <Footer />
    </div>
  );
}
