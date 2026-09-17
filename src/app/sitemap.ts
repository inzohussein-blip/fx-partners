import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/utils";
import { createPublicClient } from "@/lib/supabase/public";
import { EN_TRANSLATED } from "@/lib/seo";
import { getAllPairs } from "@/lib/broker-pairs";
import { populatedCategories } from "@/lib/best-for";
import { getPublishedBrokers } from "@/lib/published-brokers";

// Public data only, so it need not be rebuilt on every crawl. Regenerated at
// most hourly; a newly published broker or post appears within that window.
export const revalidate = 3600;

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
  "/best",
  // Trust pages. They rank for nothing, and on a site about money they are
  // exactly what a reader (and a quality rater) checks before believing the
  // rest — so they belong in the index rather than being reachable only from
  // the footer.
  "/contact",
  "/terms",
  "/privacy",
  "/cookies",
  "/payouts",
  // How the rankings are decided. It ranks for little on its own, but a
  // "best broker for X" page is a claim, and this is the page that page
  // points at — so a crawler should be able to reach it directly.
  "/methodology",
];

/** Pages whose value is trust rather than traffic — indexed, ranked lower. */
const LOW_PRIORITY = new Set([
  "/contact",
  "/terms",
  "/privacy",
  "/cookies",
  "/payouts",
  "/sitemap",
]);

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
      // While /en is untranslated it is the Arabic page on a second URL, so it
      // is not listed as an alternate and not submitted at all.
      alternates: {
        languages: EN_TRANSLATED
          ? { ar: `${base}${path || "/"}`, en: `${base}/en${path}` }
          : { ar: `${base}${path || "/"}` },
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
      const supabase = createPublicClient();
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

      // One entry per head-to-head pair. These are the highest-intent pages on
      // the site — "X vs Y" is what someone searches in the last minute before
      // choosing — so they rank just under the broker pages themselves.
      for (const pair of await getAllPairs(supabase)) {
        push(`/compare/vs/${pair.slug}`, now, "weekly", 0.65);
      }

      // "Best for X" lists. Only the ones that actually have a qualifying
      // broker are submitted: the page itself 404s when empty, so listing an
      // unpopulated category would be submitting a URL we know is a 404.
      for (const { category } of populatedCategories(await getPublishedBrokers(supabase))) {
        push(`/best/${category.slug}`, now, "weekly", 0.7);
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
