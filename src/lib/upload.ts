"use client";

import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Upload an image to the public `media` bucket and return its public URL.
 * Client-side; Storage RLS restricts writes to admins.
 */
export async function uploadToMedia(file: File): Promise<string> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("لم يُهيّأ التخزين بعد.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("يُسمح بالصور فقط.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("حجم الصورة يتجاوز 5 ميغابايت.");
  }

  const supabase = createClient();
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}
