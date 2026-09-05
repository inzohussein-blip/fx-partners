"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: boolean; error?: string };

// Only these tables (with a sort_order column) may be reordered.
const ALLOWED: Record<string, string[]> = {
  brokers: ["/", "/brokers", "/compare", "/dashboard/admin/brokers"],
  trading_resources: ["/free-tools", "/dashboard/admin/resources"],
  partners: ["/", "/dashboard/admin/partners"],
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

/** Persist a new display order (sort_order = position) for an allowed table. */
export async function reorderRecords(
  table: string,
  orderedIds: string[]
): Promise<ActionResult> {
  const paths = ALLOWED[table];
  if (!paths) return { ok: false, error: "جدول غير مسموح" };

  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };

  // Apply the whole order in one atomic statement (see migration 0022) so a
  // failure can't leave rows with a partial/inconsistent sort_order.
  const { error } = await supabase.rpc("reorder_records", {
    p_table: table,
    p_ids: orderedIds,
  });
  if (error) return { ok: false, error: error.message };

  for (const p of paths) revalidatePath(p);
  return { ok: true };
}
