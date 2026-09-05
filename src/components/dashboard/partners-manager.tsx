"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { savePartner, deletePartner, type PartnerInput } from "@/lib/actions/admin";
import { MediaPicker } from "@/components/dashboard/media-picker";
import { Plus, Trash2 } from "lucide-react";

type Partner = PartnerInput & { id: string };

const categories = [
  { value: "broker", label: "وسيط (Broker)" },
  { value: "liquidity", label: "سيولة (Liquidity)" },
  { value: "technology", label: "تقنية (Technology)" },
];

const empty: PartnerInput = {
  name: "",
  logo_url: "",
  website: "",
  description: "",
  category: "broker",
  sort_order: 0,
  is_active: true,
};

export function PartnersManager({ partners }: { partners: Partner[] }) {
  return (
    <div className="space-y-5">
      <PartnerCard title="إضافة شريك جديد" initial={empty} isNew />
      {partners.map((p) => (
        <PartnerCard key={p.id} title={p.name || "شريك"} initial={p} />
      ))}
      {partners.length === 0 && (
        <p className="text-sm text-slate-500">لا يوجد شركاء بعد.</p>
      )}
    </div>
  );
}

function PartnerCard({
  title,
  initial,
  isNew,
}: {
  title: string;
  initial: PartnerInput;
  isNew?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<PartnerInput>(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof PartnerInput>(k: K, v: PartnerInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setError(null);
    startTransition(async () => {
      const res = await savePartner(form);
      if (!res.ok) return setError(res.error ?? "فشل الحفظ");
      setMsg("تم الحفظ");
      if (isNew) setForm(empty);
      router.refresh();
    });
  }

  function remove() {
    if (!initial.id || !confirm("حذف هذا الشريك؟")) return;
    startTransition(async () => {
      await deletePartner(initial.id!);
      router.refresh();
    });
  }

  return (
    <form onSubmit={save} className="card-surface p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">
          {isNew ? (
            <span className="inline-flex items-center gap-2 text-brand-300">
              <Plus className="h-4 w-4" /> {title}
            </span>
          ) : (
            title
          )}
        </h3>
        {!isNew && (
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            حذف
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="الاسم" value={form.name} onChange={(v) => set("name", v)} required />
        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-300">التصنيف</span>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white focus:border-brand-500/50 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <div>
          <Field label="رابط الشعار" value={form.logo_url ?? ""} onChange={(v) => set("logo_url", v)} mono />
          <div className="mt-2 flex items-center gap-3">
            <MediaPicker onSelect={(url) => set("logo_url", url)} label="اختر أو ارفع شعاراً" />
            {form.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.logo_url} alt="" className="h-9 w-9 rounded-lg border border-white/10 bg-white object-contain p-0.5" />
            )}
          </div>
        </div>
        <Field label="الموقع" value={form.website ?? ""} onChange={(v) => set("website", v)} mono />
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm text-slate-300">الوصف</span>
          <textarea
            value={form.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white focus:border-brand-500/50 focus:outline-none"
          />
        </label>
        <Field
          label="الترتيب"
          type="number"
          value={String(form.sort_order ?? 0)}
          onChange={(v) => set("sort_order", Number(v))}
        />
        <label className="flex items-center gap-2 pt-7">
          <input
            type="checkbox"
            checked={form.is_active ?? true}
            onChange={(e) => set("is_active", e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-ink-900 text-brand-500 focus:ring-brand-500"
          />
          <span className="text-sm text-slate-300">نشط (يظهر في الموقع)</span>
        </label>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "جارٍ الحفظ…" : isNew ? "إضافة" : "حفظ"}
        </Button>
        {msg && <span className="text-sm text-brand-300">{msg}</span>}
        {error && <span className="text-sm text-red-300">{error}</span>}
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  mono,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  mono?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-slate-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white focus:border-brand-500/50 focus:outline-none ${
          mono ? "font-mono text-sm" : ""
        }`}
      />
    </label>
  );
}
