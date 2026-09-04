import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private / non-indexable areas.
      disallow: ["/dashboard/", "/api/", "/auth/", "/go/", "/r/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
