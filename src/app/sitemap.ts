import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Public marketing routes (Arabic has no prefix; English is under /en).
const STATIC_PATHS = [
  "",
  "/affiliates",
  "/compare",
  "/tools",
  "/offers",
  "/brokers",
  "/blog",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    entries.push({
      url: `${base}${path || "/"}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: path === "" ? 1 : 0.8,
    });
    entries.push({
      url: `${base}/en${path}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  // Dynamic content: broker landing pages + blog posts (both locales).
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createClient();
      const [{ data: brokers }, { data: posts }] = await Promise.all([
        supabase.from("brokers").select("slug,updated_at").eq("is_published", true),
        supabase.from("posts").select("slug,published_at").eq("status", "published"),
      ]);

      for (const b of (brokers as { slug: string; updated_at: string | null }[]) ?? []) {
        for (const prefix of ["", "/en"]) {
          entries.push({
            url: `${base}${prefix}/brokers/${b.slug}`,
            lastModified: b.updated_at ? new Date(b.updated_at) : now,
            changeFrequency: "weekly",
            priority: prefix ? 0.5 : 0.7,
          });
        }
      }

      for (const p of (posts as { slug: string; published_at: string | null }[]) ?? []) {
        for (const prefix of ["", "/en"]) {
          entries.push({
            url: `${base}${prefix}/blog/${p.slug}`,
            lastModified: p.published_at ? new Date(p.published_at) : now,
            changeFrequency: "monthly",
            priority: prefix ? 0.4 : 0.6,
          });
        }
      }
    }
  } catch {
    /* fall back to static entries */
  }

  return entries;
}
