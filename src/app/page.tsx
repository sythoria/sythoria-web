import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features";
import Comparison from "@/components/marketing/Comparison";
import CTA from "@/components/marketing/CTA";
import Footer from "@/components/marketing/Footer";
import SpatialCanvas from "@/components/marketing/SpatialCanvas";
import RefractiveBackground from "@/components/marketing/RefractiveBackground";
import { DESKTOP_VERSION } from "@/lib/site-config";

export const revalidate = 60;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-transparent overflow-x-hidden">
      <RefractiveBackground />
      <Navbar />
      <SpatialCanvas>
        <main id="main-content">
          <Hero latestVersion={DESKTOP_VERSION} />
          <Features />
          <Comparison />
          <CTA />
        </main>
        <Footer />
      </SpatialCanvas>
    </div>
  );
}
