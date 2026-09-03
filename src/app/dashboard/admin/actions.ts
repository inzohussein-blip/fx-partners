"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: boolean; error?: string };

/** Ensure the current session belongs to an admin before mutating. */
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

const IB_STATUSES = ["pending", "approved", "suspended", "rejected"] as const;
type IbStatus = (typeof IB_STATUSES)[number];

/** Approve / reject / suspend an IB account. */
export async function updateIbStatus(
  ibId: string,
  status: IbStatus
): Promise<ActionResult> {
  if (!IB_STATUSES.includes(status)) {
    return { ok: false, error: "حالة غير صالحة" };
  }

  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };

  const { error } = await supabase
    .from("ib_accounts")
    .update({ status })
    .eq("id", ibId);

  if (error) return { ok: false, error: error.message };

  // A newly approved IB needs a wallet row so the dashboard renders.
  if (status === "approved") {
    await supabase
      .from("wallets")
      .upsert({ ib_id: ibId }, { onConflict: "ib_id" });
  }

  revalidatePath("/dashboard/admin");
  return { ok: true };
}

const WD_STATUSES = ["pending", "processing", "paid", "rejected"] as const;
type WithdrawalStatus = (typeof WD_STATUSES)[number];

/** Move a withdrawal request through its lifecycle. */
export async function updateWithdrawalStatus(
  withdrawalId: string,
  status: WithdrawalStatus
): Promise<ActionResult> {
  if (!WD_STATUSES.includes(status)) {
    return { ok: false, error: "حالة غير صالحة" };
  }

  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };

  const { error } = await supabase
    .from("withdrawals")
    .update({ status })
    .eq("id", withdrawalId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/admin");
  return { ok: true };
}
