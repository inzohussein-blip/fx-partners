"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: boolean; error?: string };

// Table → the single field editable from the network map (kept tight for safety).
const ALLOWED: Record<string, { field: string; paths: string[] }> = {
  brokers: { field: "name", paths: ["/", "/brokers", "/compare", "/dashboard/admin/brokers"] },
  broker_links: { field: "referral_url", paths: ["/brokers", "/dashboard/admin/brokers"] },
  coupons: { field: "title", paths: ["/offers", "/dashboard/admin/campaigns"] },
};

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

/** Update a single allow-listed field of a record (from the network map). */
export async function quickUpdate(
  table: string,
  id: string,
  value: string
): Promise<ActionResult> {
  const cfg = ALLOWED[table];
  if (!cfg) return { ok: false, error: "غير مسموح" };
  if (!value.trim()) return { ok: false, error: "القيمة مطلوبة" };

  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };

  const { error } = await supabase.from(table).update({ [cfg.field]: value.trim() }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  for (const p of cfg.paths) revalidatePath(p);
  revalidatePath("/dashboard/admin/network");
  return { ok: true };
}
