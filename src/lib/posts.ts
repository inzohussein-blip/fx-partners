import { createClient } from "@/lib/supabase/server";

/**
 * The slugs of currently-published blog posts.
 *
 * The broker, comparison and category pages cross-link to blog guides from
 * static maps. Those maps are written ahead of the content, so a link must be
 * suppressed until its post is actually published — otherwise the page renders
 * a visible internal link that 404s for readers and crawlers, the opposite of
 * what the cross-linking is for. Callers gate each blog link on this set.
 */
export async function getPublishedPostSlugs(): Promise<Set<string>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return new Set();
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("posts")
      .select("slug")
      .eq("status", "published");
    return new Set((data as { slug: string }[] | null)?.map((r) => r.slug) ?? []);
  } catch {
    return new Set();
  }
}
