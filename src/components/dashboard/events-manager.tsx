"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { saveEvent, deleteEvent, setEventActive } from "@/lib/actions/events";
import { CalendarDays, Trash2, Loader2, Plus, Eye, EyeOff } from "lucide-react";

export type AdminEvent = {
  id: string;
  title: string;
  kind: string;
  country: string | null;
  event_date: string;
  event_time: string | null;
  is_active: boolean;
  broker_name: string | null;
};

const KIND_LABELS: Record<string, string> = {
  holiday: "عطلة رسمية",
  margin: "تغيير الهامش",
  hours: "ساعات التداول",
  news: "خبر مؤثّر",
};

const input =
  "w-full rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none";

export function EventsManager({
  events,
  brokers,
}: {
  events: AdminEvent[];
  brokers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState("holiday");
  const [country, setCountry] = useState("");
  const [brokerId, setBrokerId] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    setError(null);
    if (!title.trim() || !eventDate) {
      setError("العنوان والتاريخ مطلوبان.");
      return;
    }
    setBusy("add");
    const res = await saveEvent({
      title,
      description,
      kind,
      country,
      brokerId: brokerId || null,
      eventDate,
      eventTime,
    });
    setBusy(null);
    if (!res.ok) return setError(res.error ?? "تعذّر الحفظ");
    setTitle("");
    setDescription("");
    setCountry("");
    setEventTime("");
    router.refresh();
  }

  async function remove(id: string) {
    setBusy(id);
    await deleteEvent(id);
    setBusy(null);
    router.refresh();
  }

  async function toggle(id: string, active: boolean) {
    setBusy(id);
    await setEventActive(id, active);
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="card-surface space-y-3 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={input} placeholder="عنوان الحدث" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className={input} type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} dir="ltr" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <select className={input} value={kind} onChange={(e) => setKind(e.target.value)}>
            {Object.entries(KIND_LABELS).map(([k, v]) => (
              <option key={k} value={k} className="bg-ink-900">{v}</option>
            ))}
          </select>
          <select className={input} value={brokerId} onChange={(e) => setBrokerId(e.target.value)}>
            <option value="" className="bg-ink-900">كل الشركات (عام)</option>
            {brokers.map((b) => (
              <option key={b.id} value={b.id} className="bg-ink-900">{b.name}</option>
            ))}
          </select>
          <input className={input} placeholder="الوقت (مثال: 16:30 GMT)" value={eventTime} onChange={(e) => setEventTime(e.target.value)} dir="ltr" />
        </div>
        <input className={input} placeholder="الدولة (اختياري)" value={country} onChange={(e) => setCountry(e.target.value)} />
        <textarea className={input} rows={2} placeholder="وصف مختصر (اختياري)" value={description} onChange={(e) => setDescription(e.target.value)} />
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button
          onClick={add}
          disabled={busy === "add"}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
        >
          {busy === "add" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          إضافة حدث
        </button>
      </div>

      {/* List */}
      {events.length === 0 ? (
        <p className="text-sm text-slate-500">لا توجد أحداث بعد.</p>
      ) : (
        <ul className="space-y-2">
          {events.map((e) => (
            <li key={e.id} className="card-surface flex items-center gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-500/10 text-brand-300">
                <CalendarDays className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-white">{e.title}</div>
                <div className="text-xs text-slate-500">
                  <span dir="ltr">{e.event_date}</span> · {KIND_LABELS[e.kind] ?? e.kind}
                  {e.broker_name ? ` · ${e.broker_name}` : " · عام"}
                </div>
              </div>
              <button onClick={() => toggle(e.id, !e.is_active)} disabled={busy === e.id} className="p-2 text-slate-400 hover:text-white" aria-label={e.is_active ? "إخفاء" : "إظهار"}>
                {e.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button onClick={() => remove(e.id)} disabled={busy === e.id} className="p-2 text-slate-400 hover:text-red-300" aria-label="حذف">
                {busy === e.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
