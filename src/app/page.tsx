import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features";
import Comparison from "@/components/marketing/Comparison";
import CTA from "@/components/marketing/CTA";
import Footer from "@/components/marketing/Footer";
import SpatialCanvas from "@/components/marketing/SpatialCanvas";
import RefractiveBackground from "@/components/marketing/RefractiveBackground";
import { getLatestVersion } from "@/lib/changelog";

export const revalidate = 60;

export default async function LandingPage() {
  const latestVersion = await getLatestVersion();

  return (
    <div className="min-h-screen bg-transparent overflow-x-hidden">
      <RefractiveBackground />
      <Navbar />
      <SpatialCanvas>
        <main id="main-content">
          <Hero latestVersion={latestVersion} />
          <Features />
          <Comparison />
          <CTA />
        </main>
        <Footer />
      </SpatialCanvas>
    </div>
  );
}
