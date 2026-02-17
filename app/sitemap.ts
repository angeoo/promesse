import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const pages = [
    "/",
    "/association",
    "/actions",
    "/programmes",
    "/ressources",
    "/s-engager",
    "/partenariats",
    "/actualites",
    "/contact"
  ];

  return pages.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7
  }));
}

