import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Public marketing routes (Arabic has no prefix; English is under /en).
const STATIC_PATHS = [
  "",
  "/affiliates",
  "/compare",
  "/compare/vs",
  "/spreads",
  "/tools",
  "/calendar",
  "/free-tools",
  "/offers",
  "/brokers",
  "/forum",
  "/blog",
  "/about",
  // Trust pages. They rank for nothing, and on a site about money they are
  // exactly what a reader (and a quality rater) checks before believing the
  // rest — so they belong in the index rather than being reachable only from
  // the footer.
  "/contact",
  "/terms",
  "/privacy",
];

/** Pages whose value is trust rather than traffic — indexed, ranked lower. */
const LOW_PRIORITY = new Set(["/contact", "/terms", "/privacy", "/sitemap"]);

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
    const priority = path === "" ? 1 : LOW_PRIORITY.has(path) ? 0.3 : 0.8;
    push(path, now, LOW_PRIORITY.has(path) ? "yearly" : "weekly", priority);
  }

  // Dynamic content: broker landing pages + blog posts.
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createClient();
      const [{ data: brokers }, { data: posts }, { data: channels }, { data: forumPosts }] =
        await Promise.all([
          supabase.from("brokers").select("slug,updated_at").eq("is_published", true),
          supabase.from("posts").select("slug,published_at").eq("status", "published"),
          supabase.from("forum_channels").select("slug,updated_at").eq("status", "active"),
          supabase
            .from("forum_posts")
            .select("slug,updated_at,forum_channels!inner(slug,status)")
            .eq("status", "published")
            .eq("forum_channels.status", "active"),
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

      for (const c of (channels as { slug: string; updated_at: string | null }[]) ?? []) {
        push(`/forum/${c.slug}`, c.updated_at ? new Date(c.updated_at) : now, "daily", 0.6);
      }

      for (const p of (forumPosts as
        | { slug: string; updated_at: string | null; forum_channels: { slug: string } }[]
        | null) ?? []) {
        const channelSlug = p.forum_channels?.slug;
        if (!channelSlug) continue;
        push(
          `/forum/${channelSlug}/${p.slug}`,
          p.updated_at ? new Date(p.updated_at) : now,
          "weekly",
          0.5
        );
      }
    }
  } catch {
    /* fall back to static entries */
  }

  return entries;
}
