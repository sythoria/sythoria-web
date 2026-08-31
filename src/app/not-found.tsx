import type { Metadata } from "next";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import RefractiveBackground from "@/components/marketing/RefractiveBackground";
import NotFoundClientView from "@/components/marketing/NotFoundClientView";

export const metadata: Metadata = {
  title: "404",
  description:
    "The page or resource you requested could not be found. Return to Sythoria's home, documentation, or downloads.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-transparent relative overflow-x-hidden flex flex-col justify-between">
      {/* Decorative ambient gradient background */}
      <RefractiveBackground />

      {/* Floating navigation bar */}
      <Navbar />

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1 flex items-center">
        <NotFoundClientView />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
