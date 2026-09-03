"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function WithdrawForm({
  ibId,
  balance,
}: {
  ibId: string | null;
  balance: number;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);

    const value = Number(amount);
    if (!ibId) return setError("لا يوجد حساب IB مرتبط بحسابك بعد.");
    if (!value || value <= 0) return setError("أدخل مبلغاً صحيحاً.");
    if (value > balance) return setError("المبلغ يتجاوز رصيدك المتاح.");

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("withdrawals").insert({
      ib_id: ibId,
      amount: value,
      method,
      status: "pending",
    });
    setLoading(false);

    if (error) return setError(error.message);
    setOk(true);
    setAmount("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card-surface p-6">
      <h2 className="text-lg font-semibold text-white">طلب سحب</h2>
      <p className="mt-1 text-sm text-slate-400">
        الرصيد المتاح: <span className="text-brand-300">{formatCurrency(balance)}</span>
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-300">المبلغ (USD)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-300">طريقة السحب</span>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white focus:border-brand-500/50 focus:outline-none"
          >
            <option value="bank_transfer">تحويل بنكي</option>
            <option value="crypto">عملة رقمية (USDT)</option>
            <option value="ewallet">محفظة إلكترونية</option>
          </select>
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      {ok && (
        <p className="mt-4 rounded-lg bg-brand-500/10 px-3 py-2 text-sm text-brand-200">
          تم إرسال طلب السحب وهو قيد المراجعة.
        </p>
      )}

      <div className="mt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "جارٍ الإرسال…" : "إرسال الطلب"}
        </Button>
      </div>
    </form>
  );
}
