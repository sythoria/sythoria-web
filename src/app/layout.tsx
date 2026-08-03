import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import {
  GITHUB_LATEST_RELEASE_URL,
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
    default: "Sythoria",
    template: "%s | Sythoria",
  },
  description:
    "Download Sythoria, a Tauri desktop client for local and hosted language models, and learn how to configure providers, tools, voice, and project workspaces.",
  applicationName: "Sythoria",
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Sythoria",
    url: "/",
    title: "Sythoria",
    description:
      "A desktop client for local and hosted language models, with provider configuration, tools, voice, and project workspaces.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sythoria",
    description:
      "A desktop client for local and hosted language models, with provider configuration, tools, voice, and project workspaces.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Sythoria",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Windows 10/11, macOS 12+, Linux x86_64",
  downloadUrl: GITHUB_LATEST_RELEASE_URL,
  url: SITE_URL,
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
            __html: JSON.stringify(softwareApplicationJsonLd).replace(
              /</g,
              "\\u003c"
            ),
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
