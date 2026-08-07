import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import {
  GITHUB_LATEST_RELEASE_URL,
  GITHUB_REPOSITORY_URL,
  SITE_URL,
} from "@/lib/site-config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sythoria – Privacy-First AI Desktop Client",
    template: "%s | Sythoria",
  },
  description:
    "Sythoria is a privacy-first, lightweight AI desktop client for local and hosted language models. Connect OpenAI, Anthropic, Ollama, Gemini, and custom endpoints with zero telemetry.",
  applicationName: "Sythoria",
  keywords: [
    "Sythoria",
    "AI Desktop App",
    "Privacy-First AI",
    "Local LLM Client",
    "Ollama UI",
    "OpenAI Desktop",
    "Tauri AI App",
    "AI Chat Client",
  ],
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    type: "website",
    siteName: "Sythoria",
    url: "/",
    title: "Sythoria – Privacy-First AI Desktop Client",
    description:
      "Privacy-first, lightweight AI desktop client for local and hosted language models. Connect OpenAI, Anthropic, Ollama, Gemini, and custom endpoints with zero telemetry.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sythoria – Privacy-First AI Desktop Client",
    description:
      "Privacy-first, lightweight AI desktop client for local and hosted language models. Connect OpenAI, Anthropic, Ollama, Gemini, and custom endpoints with zero telemetry.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLdGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Sythoria",
      description: "Privacy-First AI Desktop Client for Local and Hosted LLMs",
      inLanguage: "en-US",
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Sythoria",
      url: SITE_URL,
      logo: `${SITE_URL}/logonobg.png`,
      sameAs: [GITHUB_REPOSITORY_URL],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "Sythoria",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Windows 10/11, macOS 12+, Linux x86_64",
      downloadUrl: GITHUB_LATEST_RELEASE_URL,
      url: SITE_URL,
      description:
        "Privacy-first AI desktop application supporting OpenAI, Anthropic, Gemini, Ollama, OpenRouter, and NVIDIA NIM.",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = null;
                try { theme = localStorage.getItem('sythoria-theme'); } catch (_) {}
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdGraph).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
