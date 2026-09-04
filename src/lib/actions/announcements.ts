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

export type AnnouncementInput = {
  id?: string;
  title: string;
  body: string;
  category?: string;
  is_published?: boolean;
};

const CATEGORIES = ["feature", "promo", "commission", "news"];

export async function saveAnnouncement(
  input: AnnouncementInput
): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  if (!input.title?.trim()) return { ok: false, error: "العنوان مطلوب" };
  if (!input.body?.trim()) return { ok: false, error: "النص مطلوب" };

  const category = CATEGORIES.includes(input.category ?? "")
    ? input.category
    : "news";

  const row = {
    title: input.title.trim(),
    body: input.body.trim(),
    category,
    is_published: input.is_published ?? true,
  };

  const query = input.id
    ? supabase.from("announcements").update(row).eq("id", input.id)
    : supabase.from("announcements").insert(row);

  const { error } = await query;
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/updates");
  revalidatePath("/dashboard/admin/announcements");
  return { ok: true };
}

export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };

  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/updates");
  revalidatePath("/dashboard/admin/announcements");
  return { ok: true };
}
