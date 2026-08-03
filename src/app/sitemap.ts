import type { MetadataRoute } from "next";
import { getAllDocs } from "@/lib/docs";
import { SITE_URL } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const verifiedAt = new Date("2026-08-02T00:00:00Z");
  const docs = getAllDocs().map((doc) => ({
    url: `${SITE_URL}/docs/${doc.slug}`,
    lastModified: doc.lastVerifiedDate
      ? new Date(`${doc.lastVerifiedDate}T00:00:00Z`)
      : verifiedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: verifiedAt,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/docs`,
      lastModified: verifiedAt,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/changelog`,
      lastModified: verifiedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...docs,
  ];
}
