"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { updateIbStatus, updateWithdrawalStatus } from "@/lib/actions/admin";

type Btn = { status: string; label: string; tone: "approve" | "reject" | "neutral" };

const toneClass: Record<Btn["tone"], string> = {
  approve: "bg-brand-500/15 text-brand-200 hover:bg-brand-500/25",
  reject: "bg-red-500/10 text-red-300 hover:bg-red-500/20",
  neutral: "bg-white/5 text-slate-300 hover:bg-white/10",
};

function ActionRow({
  buttons,
  run,
}: {
  buttons: Btn[];
  run: (status: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handle(status: string) {
    setError(null);
    startTransition(async () => {
      const res = await run(status);
      if (!res.ok) {
        setError(res.error ?? "فشل الإجراء");
        toast.error(res.error ?? "فشل تنفيذ الإجراء");
      } else {
        toast.success("تم تحديث الحالة");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-2">
        {buttons.map((b) => (
          <button
            key={b.status}
            type="button"
            disabled={pending}
            onClick={() => handle(b.status)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50",
              toneClass[b.tone]
            )}
          >
            {b.label}
          </button>
        ))}
      </div>
      {error && <span className="text-xs text-red-300">{error}</span>}
    </div>
  );
}

export function IbActions({ ibId }: { ibId: string }) {
  return (
    <ActionRow
      run={(status) => updateIbStatus(ibId, status as never)}
      buttons={[
        { status: "approved", label: "اعتماد", tone: "approve" },
        { status: "rejected", label: "رفض", tone: "reject" },
        { status: "suspended", label: "تعليق", tone: "neutral" },
      ]}
    />
  );
}

export function WithdrawalActions({ withdrawalId }: { withdrawalId: string }) {
  return (
    <ActionRow
      run={(status) => updateWithdrawalStatus(withdrawalId, status as never)}
      buttons={[
        { status: "processing", label: "قيد المعالجة", tone: "neutral" },
        { status: "paid", label: "تم الدفع", tone: "approve" },
        { status: "rejected", label: "رفض", tone: "reject" },
      ]}
    />
  );
}
