import { createClient } from "@/lib/supabase/server";

export type MediaItem = {
  name: string;
  url: string;
  updatedAt: string | null;
};

/** List images in the public `media` bucket (newest first). */
export async function listMedia(): Promise<MediaItem[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase.storage.from("media").list("", {
      limit: 200,
      sortBy: { column: "created_at", order: "desc" },
    });
    return (data ?? [])
      .filter((f) => f.name && !f.name.startsWith("."))
      .map((f) => ({
        name: f.name,
        url: supabase.storage.from("media").getPublicUrl(f.name).data.publicUrl,
        updatedAt: (f.updated_at as string | undefined) ?? null,
      }));
  } catch {
    return [];
  }
}
