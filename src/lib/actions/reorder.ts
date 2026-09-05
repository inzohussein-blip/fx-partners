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

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from(table).update({ sort_order: index }).eq("id", id)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, error: failed.error.message };

  for (const p of paths) revalidatePath(p);
  return { ok: true };
}
