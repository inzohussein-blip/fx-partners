import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Public marketing routes (Arabic has no prefix; English is under /en).
const STATIC_PATHS = [
  "",
  "/affiliates",
  "/compare",
  "/spreads",
  "/tools",
  "/calendar",
  "/free-tools",
  "/offers",
  "/brokers",
  "/blog",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // One canonical (Arabic) entry per URL, with hreflang alternates pointing
  // to the English version — the structure Google recommends for i18n.
  const push = (
    path: string,
    lastModified: Date,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: number
  ) => {
    entries.push({
      url: `${base}${path || "/"}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: {
          ar: `${base}${path || "/"}`,
          en: `${base}/en${path}`,
        },
      },
    });
  };

  for (const path of STATIC_PATHS) {
    push(path, now, "weekly", path === "" ? 1 : 0.8);
  }

  // Dynamic content: broker landing pages + blog posts.
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createClient();
      const [{ data: brokers }, { data: posts }] = await Promise.all([
        supabase.from("brokers").select("slug,updated_at").eq("is_published", true),
        supabase.from("posts").select("slug,published_at").eq("status", "published"),
      ]);

      for (const b of (brokers as { slug: string; updated_at: string | null }[]) ?? []) {
        push(
          `/brokers/${b.slug}`,
          b.updated_at ? new Date(b.updated_at) : now,
          "weekly",
          0.7
        );
      }

      for (const p of (posts as { slug: string; published_at: string | null }[]) ?? []) {
        push(
          `/blog/${p.slug}`,
          p.published_at ? new Date(p.published_at) : now,
          "monthly",
          0.6
        );
      }
    }
  } catch {
    /* fall back to static entries */
  }

  return entries;
}
