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
