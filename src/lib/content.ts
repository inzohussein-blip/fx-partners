import { createClient } from "@/lib/supabase/server";

/**
 * Fetch an editable content block from `site_content` by key.
 * Falls back to the provided defaults if Supabase is not configured yet
 * or the key is missing — so the marketing site renders out of the box.
 */
export async function getContent<T extends Record<string, unknown>>(
  key: string,
  fallback: T
): Promise<T> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return fallback;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    return { ...fallback, ...(data?.value as T) };
  } catch {
    return fallback;
  }
}

/**
 * The `site_content` key that holds a block's copy for a given locale.
 *
 * Each locale gets its own row rather than one shared row, because a single
 * stored value would mean an admin editing the Arabic headline silently
 * replaces the English one with Arabic text. An English page with no English
 * override falls through to the message catalogue, which is a real
 * translation — not to whatever the Arabic row happens to say.
 */
export function contentKeyFor(key: string, locale: string): string {
  return locale === "en" ? `${key}.en` : key;
}
