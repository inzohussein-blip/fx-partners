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

export type ResourceInput = {
  title: string;
  description?: string;
  kind: string;
  fileUrl: string;
  brokerId?: string | null;
};

export async function saveResource(input: ResourceInput): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  if (!input.title?.trim()) return { ok: false, error: "العنوان مطلوب" };
  if (!input.fileUrl?.trim()) return { ok: false, error: "رابط الملف مطلوب" };

  const { error } = await supabase.from("trading_resources").insert({
    title: input.title.trim(),
    description: input.description?.trim() || null,
    kind: input.kind || "indicator",
    file_url: input.fileUrl.trim(),
    broker_id: input.brokerId || null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/free-tools");
  revalidatePath("/dashboard/admin/resources");
  return { ok: true };
}

export async function deleteResource(id: string): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  const { error } = await supabase.from("trading_resources").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/free-tools");
  revalidatePath("/dashboard/admin/resources");
  return { ok: true };
}

export async function setResourceActive(id: string, active: boolean): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  const { error } = await supabase
    .from("trading_resources")
    .update({ is_active: active })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/free-tools");
  revalidatePath("/dashboard/admin/resources");
  return { ok: true };
}
