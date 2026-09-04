"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { withdrawalSchema, type WithdrawalValues } from "@/lib/validators";
import { requestWithdrawal } from "@/lib/actions/wallet";

export function WithdrawForm({
  ibId,
  balance,
}: {
  ibId: string | null;
  balance: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WithdrawalValues>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: { amount: undefined, method: "bank_transfer", destination: "" },
  });

  function onSubmit(values: WithdrawalValues) {
    setServerError(null);
    setOk(false);
    if (!ibId) {
      setServerError("لا يوجد حساب IB مرتبط بحسابك بعد.");
      return;
    }
    startTransition(async () => {
      const res = await requestWithdrawal(values);
      if (!res.ok) setServerError(res.error ?? "فشل الإرسال");
      else {
        setOk(true);
        reset({ amount: undefined, method: "bank_transfer", destination: "" });
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-surface p-6">
      <h2 className="text-lg font-semibold text-white">طلب سحب</h2>
      <p className="mt-1 text-sm text-slate-400">
        الرصيد المتاح:{" "}
        <span className="text-brand-300">{formatCurrency(balance)}</span>
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-300">المبلغ (USD)</span>
          <input
            type="number"
            step="0.01"
            {...register("amount")}
            placeholder="0.00"
            className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none"
          />
          {errors.amount && (
            <span className="mt-1 block text-xs text-red-300">
              {errors.amount.message}
            </span>
          )}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-300">طريقة السحب</span>
          <select
            {...register("method")}
            className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white focus:border-brand-500/50 focus:outline-none"
          >
            <option value="bank_transfer">تحويل بنكي</option>
            <option value="crypto">عملة رقمية (USDT)</option>
            <option value="ewallet">محفظة إلكترونية</option>
          </select>
          {errors.method && (
            <span className="mt-1 block text-xs text-red-300">
              {errors.method.message}
            </span>
          )}
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm text-slate-300">
            وجهة السحب (رقم حساب / عنوان محفظة)
          </span>
          <input
            {...register("destination")}
            placeholder="IBAN / TRC20 / …"
            className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 font-mono text-sm text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none"
          />
          {errors.destination && (
            <span className="mt-1 block text-xs text-red-300">
              {errors.destination.message}
            </span>
          )}
        </label>
      </div>

      {serverError && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {serverError}
        </p>
      )}
      {ok && (
        <p className="mt-4 rounded-lg bg-brand-500/10 px-3 py-2 text-sm text-brand-200">
          تم إرسال طلب السحب وهو قيد المراجعة.
        </p>
      )}

      <div className="mt-4">
        <Button type="submit" disabled={pending}>
          {pending ? "جارٍ الإرسال…" : "إرسال الطلب"}
        </Button>
      </div>
    </form>
  );
}
