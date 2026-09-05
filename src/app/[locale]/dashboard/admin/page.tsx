import { PageHeader } from "@/components/dashboard/page-header";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/stat-card";
import { IbActions, WithdrawalActions } from "@/components/dashboard/admin-actions";
import { formatCurrency } from "@/lib/utils";
import { UserCheck, Clock, BadgeDollarSign, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

type Profile = { full_name: string | null; email: string | null; country: string | null };
type Ib = {
  id: string;
  ib_code: string;
  status: string;
  commission_rate: number;
  cpa_amount: number;
  created_at: string;
  profiles: Profile | null;
};
type Withdrawal = {
  id: string;
  amount: number;
  method: string;
  status: string;
  requested_at: string;
  ib_accounts: { ib_code: string; profiles: Profile | null } | null;
};

const ibStatusLabel: Record<string, { text: string; cls: string }> = {
  pending: { text: "بانتظار الاعتماد", cls: "bg-gold-500/10 text-gold-400" },
  approved: { text: "معتمد", cls: "bg-brand-500/10 text-brand-300" },
  suspended: { text: "معلّق", cls: "bg-white/10 text-slate-300" },
  rejected: { text: "مرفوض", cls: "bg-red-500/10 text-red-300" },
};

const wdStatusLabel: Record<string, { text: string; cls: string }> = {
  pending: { text: "قيد الانتظار", cls: "bg-gold-500/10 text-gold-400" },
  processing: { text: "قيد المعالجة", cls: "bg-blue-500/10 text-blue-300" },
  paid: { text: "مدفوع", cls: "bg-brand-500/10 text-brand-300" },
  rejected: { text: "مرفوض", cls: "bg-red-500/10 text-red-300" },
};

async function loadAdminData() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/dashboard");

  const [{ data: ibs }, { data: withdrawals }] = await Promise.all([
    supabase
      .from("ib_accounts")
      .select(
        "id,ib_code,status,commission_rate,cpa_amount,created_at,profiles:user_id(full_name,email,country)"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("withdrawals")
      .select(
        "id,amount,method,status,requested_at,ib_accounts:ib_id(ib_code,profiles:user_id(full_name,email))"
      )
      .order("requested_at", { ascending: false }),
  ]);

  return {
    ibs: (ibs ?? []) as unknown as Ib[],
    withdrawals: (withdrawals ?? []) as unknown as Withdrawal[],
  };
}

export default async function AdminPage() {
  const { ibs, withdrawals } = await loadAdminData();

  const pendingIbs = ibs.filter((i) => i.status === "pending");
  const pendingWd = withdrawals.filter(
    (w) => w.status === "pending" || w.status === "processing"
  );
  const totalPaid = withdrawals
    .filter((w) => w.status === "paid")
    .reduce((s, w) => s + Number(w.amount), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        icon={ShieldCheck}
        title={"الاعتمادات"}
        subtitle={"اعتماد الوكلاء (IBs) ومعالجة طلبات السحب."}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="وكلاء بانتظار الاعتماد"
          value={String(pendingIbs.length)}
          icon={UserCheck}
        />
        <StatCard
          label="طلبات سحب قيد المعالجة"
          value={String(pendingWd.length)}
          icon={Clock}
        />
        <StatCard
          label="إجمالي المدفوع"
          value={formatCurrency(totalPaid)}
          icon={BadgeDollarSign}
        />
      </div>

      {/* IB approvals */}
      <section className="card-surface p-6">
        <h2 className="text-lg font-semibold text-white">الوكلاء (IBs)</h2>
        {ibs.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">لا يوجد وكلاء بعد.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-right text-sm">
              <thead>
                <tr className="border-b border-white/5 text-slate-400">
                  <th className="pb-3 font-medium">الوكيل</th>
                  <th className="pb-3 font-medium">الكود</th>
                  <th className="pb-3 font-medium">العمولة</th>
                  <th className="pb-3 font-medium">الحالة</th>
                  <th className="pb-3 font-medium">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ibs.map((ib) => {
                  const s = ibStatusLabel[ib.status] ?? ibStatusLabel.pending;
                  return (
                    <tr key={ib.id} className="text-slate-300">
                      <td className="py-3">
                        <div className="font-medium text-white">
                          {ib.profiles?.full_name || "—"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {ib.profiles?.email}
                          {ib.profiles?.country ? ` · ${ib.profiles.country}` : ""}
                        </div>
                      </td>
                      <td className="py-3 font-mono text-xs">{ib.ib_code}</td>
                      <td className="py-3">
                        {ib.commission_rate}%
                        {Number(ib.cpa_amount) > 0 && (
                          <span className="text-slate-500">
                            {" "}
                            / CPA {formatCurrency(Number(ib.cpa_amount))}
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className={`rounded-md px-2 py-1 text-xs ${s.cls}`}>
                          {s.text}
                        </span>
                      </td>
                      <td className="py-3">
                        <IbActions ibId={ib.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Withdrawals */}
      <section className="card-surface p-6">
        <h2 className="text-lg font-semibold text-white">طلبات السحب</h2>
        {withdrawals.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">لا توجد طلبات سحب.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-right text-sm">
              <thead>
                <tr className="border-b border-white/5 text-slate-400">
                  <th className="pb-3 font-medium">الوكيل</th>
                  <th className="pb-3 font-medium">المبلغ</th>
                  <th className="pb-3 font-medium">الطريقة</th>
                  <th className="pb-3 font-medium">الحالة</th>
                  <th className="pb-3 font-medium">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {withdrawals.map((w) => {
                  const s = wdStatusLabel[w.status] ?? wdStatusLabel.pending;
                  const done = w.status === "paid" || w.status === "rejected";
                  return (
                    <tr key={w.id} className="text-slate-300">
                      <td className="py-3">
                        <div className="font-medium text-white">
                          {w.ib_accounts?.profiles?.full_name || "—"}
                        </div>
                        <div className="font-mono text-xs text-slate-500">
                          {w.ib_accounts?.ib_code}
                        </div>
                      </td>
                      <td className="py-3 font-semibold text-white">
                        {formatCurrency(Number(w.amount))}
                      </td>
                      <td className="py-3">{w.method}</td>
                      <td className="py-3">
                        <span className={`rounded-md px-2 py-1 text-xs ${s.cls}`}>
                          {s.text}
                        </span>
                      </td>
                      <td className="py-3">
                        {done ? (
                          <span className="text-xs text-slate-600">—</span>
                        ) : (
                          <WithdrawalActions withdrawalId={w.id} />
                        )}
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
