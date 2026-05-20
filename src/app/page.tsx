import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features";
import Footer from "@/components/marketing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-chat overflow-y-auto">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}
