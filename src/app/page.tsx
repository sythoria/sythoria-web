import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features";
import Comparison from "@/components/marketing/Comparison";
import Footer from "@/components/marketing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-chat overflow-y-auto">
      <Navbar />
      <Hero />
      <Features />
      <Comparison />
      <Footer />
    </div>
  );
}
