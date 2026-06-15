import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import TerminalShowcase from "@/components/marketing/TerminalShowcase";
import Features from "@/components/marketing/Features";
import Comparison from "@/components/marketing/Comparison";
import CTA from "@/components/marketing/CTA";
import Footer from "@/components/marketing/Footer";
import SpatialCanvas from "@/components/marketing/SpatialCanvas";
import RefractiveBackground from "@/components/marketing/RefractiveBackground";

async function getLatestRelease() {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
    };
    if (process.env.GH_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GH_TOKEN}`;
    }
    const res = await fetch(
      "https://api.github.com/repos/sythoria/sythoria-desktop/releases/latest",
      { next: { revalidate: 3600 }, headers }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.tag_name as string;
  } catch {
    return null;
  }
}

export default async function LandingPage() {
  const latestVersion = await getLatestRelease();

  return (
    <div className="min-h-screen bg-transparent overflow-x-hidden">
      <RefractiveBackground />
      <Navbar />
      <SpatialCanvas>
        <Hero latestVersion={latestVersion} />
        <TerminalShowcase />
        <Features />
        <Comparison />
        <CTA />
        <Footer />
      </SpatialCanvas>
    </div>
  );
}
