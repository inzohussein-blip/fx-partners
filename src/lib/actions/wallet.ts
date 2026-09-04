"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { withdrawalSchema } from "@/lib/validators";

type ActionResult = { ok: boolean; error?: string };

/**
 * Create a withdrawal request. Validates input with Zod and — crucially —
 * re-checks the available balance on the SERVER, so a tampered client can't
 * request more than it has. RLS still guarantees the row belongs to the
 * caller's own IB account.
 */
export async function requestWithdrawal(input: unknown): Promise<ActionResult> {
  const parsed = withdrawalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }
  const { amount, method, destination } = parsed.data;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "غير مصرّح" };

  const { data: ib } = await supabase
    .from("ib_accounts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!ib) return { ok: false, error: "لا يوجد حساب IB مرتبط بحسابك بعد." };

  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("ib_id", ib.id)
    .maybeSingle();

  const balance = Number(wallet?.balance ?? 0);
  if (amount > balance) {
    return { ok: false, error: "المبلغ يتجاوز رصيدك المتاح." };
  }

  const { error } = await supabase.from("withdrawals").insert({
    ib_id: ib.id,
    amount,
    method,
    destination: { detail: destination },
    status: "pending",
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/wallet");
  return { ok: true };
}
