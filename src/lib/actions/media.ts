"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: boolean; error?: string };

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, admin: false as const };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return { supabase, admin: profile?.role === "admin" };
}

/** Delete a file from the media bucket (admin only). */
export async function deleteMedia(name: string): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  if (!name) return { ok: false, error: "اسم الملف مطلوب" };

  const { error } = await supabase.storage.from("media").remove([name]);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/admin/media");
  return { ok: true };
}
