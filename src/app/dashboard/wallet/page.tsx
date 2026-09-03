import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/stat-card";
import { WithdrawForm } from "@/components/dashboard/withdraw-form";
import { formatCurrency } from "@/lib/utils";
import { Wallet, Clock, ArrowDownToLine } from "lucide-react";

export const dynamic = "force-dynamic";

type Withdrawal = {
  id: string;
  amount: number;
  method: string;
  status: string;
  requested_at: string;
};

const statusLabel: Record<string, { text: string; cls: string }> = {
  pending: { text: "قيد الانتظار", cls: "bg-gold-500/10 text-gold-400" },
  processing: { text: "قيد المعالجة", cls: "bg-blue-500/10 text-blue-300" },
  paid: { text: "مدفوع", cls: "bg-brand-500/10 text-brand-300" },
  rejected: { text: "مرفوض", cls: "bg-red-500/10 text-red-300" },
};

async function getData() {
  const empty = {
    ibId: null as string | null,
    balance: 0,
    pending: 0,
    withdrawn: 0,
    withdrawals: [] as Withdrawal[],
  };
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return empty;

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return empty;

    const { data: ib } = await supabase
      .from("ib_accounts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!ib) return empty;

    const [{ data: wallet }, { data: withdrawals }] = await Promise.all([
      supabase
        .from("wallets")
        .select("balance,pending_balance,total_withdrawn")
        .eq("ib_id", ib.id)
        .maybeSingle(),
      supabase
        .from("withdrawals")
        .select("id,amount,method,status,requested_at")
        .eq("ib_id", ib.id)
        .order("requested_at", { ascending: false }),
    ]);

    return {
      ibId: ib.id,
      balance: Number(wallet?.balance ?? 0),
      pending: Number(wallet?.pending_balance ?? 0),
      withdrawn: Number(wallet?.total_withdrawn ?? 0),
      withdrawals: withdrawals ?? [],
    };
  } catch {
    return empty;
  }
}

export default async function WalletPage() {
  const { ibId, balance, pending, withdrawn, withdrawals } = await getData();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-white">المحفظة والسحوبات</h1>
        <p className="mt-1 text-sm text-slate-400">
          تابع رصيدك وقدّم طلبات سحب الأرباح.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="الرصيد المتاح" value={formatCurrency(balance)} icon={Wallet} />
        <StatCard label="قيد التحصيل" value={formatCurrency(pending)} icon={Clock} />
        <StatCard
          label="إجمالي المسحوب"
          value={formatCurrency(withdrawn)}
          icon={ArrowDownToLine}
        />
      </div>

      <WithdrawForm ibId={ibId} balance={balance} />

      <section className="card-surface p-6">
        <h2 className="text-lg font-semibold text-white">سجل السحوبات</h2>
        {withdrawals.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">لا توجد طلبات سحب بعد.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-white/5 text-slate-400">
                  <th className="pb-3 font-medium">المبلغ</th>
                  <th className="pb-3 font-medium">الطريقة</th>
                  <th className="pb-3 font-medium">الحالة</th>
                  <th className="pb-3 font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {withdrawals.map((w) => {
                  const s = statusLabel[w.status] ?? statusLabel.pending;
                  return (
                    <tr key={w.id} className="text-slate-300">
                      <td className="py-3 font-semibold text-white">
                        {formatCurrency(Number(w.amount))}
                      </td>
                      <td className="py-3">{w.method}</td>
                      <td className="py-3">
                        <span className={`rounded-md px-2 py-1 text-xs ${s.cls}`}>
                          {s.text}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500">
                        {new Date(w.requested_at).toLocaleDateString("ar")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
