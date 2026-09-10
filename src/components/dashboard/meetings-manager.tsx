"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  addMeetingSlot,
  deleteMeetingSlot,
  updateBookingStatus,
} from "@/lib/actions/booking";
import { CalendarClock, Plus, Trash2, Loader2, Check, X } from "lucide-react";

export type AdminSlot = {
  id: string;
  starts_at: string;
  duration_min: number;
  meeting_url: string | null;
  status: string;
};

export type AdminBooking = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  meeting_type: string | null;
  message: string | null;
  status: string;
  created_at: string;
  slot: { starts_at: string } | null;
};

const TYPE_LABEL: Record<string, string> = {
  broker: "شركة تداول",
  master_ib: "وكيل رئيسي",
  liquidity: "مزوّد سيولة",
  technology: "تقنية مالية",
};

function fmt(iso: string) {
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function MeetingsManager({
  slots,
  bookings,
}: {
  slots: AdminSlot[];
  bookings: AdminBooking[];
}) {
  const router = useRouter();
  const [startsAt, setStartsAt] = useState("");
  const [duration, setDuration] = useState(30);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    setError(null);
    if (!startsAt) {
      setError("اختر تاريخاً ووقتاً.");
      return;
    }
    setBusy("add");
    // datetime-local has no timezone; treat the entered value as UTC.
    const res = await addMeetingSlot({
      startsAt: startsAt + ":00Z",
      durationMin: duration,
      meetingUrl: url,
    });
    setBusy(null);
    if (res.ok) {
      setStartsAt("");
      setUrl("");
      router.refresh();
    } else {
      setError(res.error ?? "تعذّرت الإضافة.");
    }
  }

  async function removeSlot(id: string) {
    setBusy(id);
    await deleteMeetingSlot(id);
    setBusy(null);
    router.refresh();
  }

  async function setBooking(id: string, status: "confirmed" | "cancelled") {
    setBusy(id);
    await updateBookingStatus(id, status);
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* Add slot */}
      <section className="card-surface p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Plus className="h-4 w-4 text-brand-300" />
          إضافة موعد متاح (UTC)
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 text-white focus:border-brand-500/50 focus:outline-none sm:col-span-2"
          />
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 text-white focus:border-brand-500/50 focus:outline-none"
          >
            {[15, 30, 45, 60].map((m) => (
              <option key={m} value={m}>
                {m} دقيقة
              </option>
            ))}
          </select>
          <button
            onClick={add}
            disabled={busy === "add"}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {busy === "add" ? <Loader2 className="h-4 w-4 animate-spin" /> : "إضافة"}
          </button>
        </div>
        <input
          type="url"
          dir="ltr"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="رابط Zoom / Google Meet (اختياري)"
          className="mt-3 w-full rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none"
        />
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </section>

      {/* Slots list */}
      <section className="card-surface p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <CalendarClock className="h-4 w-4 text-brand-300" />
          المواعيد ({slots.length})
        </h2>
        {slots.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">لا توجد مواعيد بعد.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/5">
            {slots.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm text-white" dir="ltr">
                    {fmt(s.starts_at)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {s.duration_min} دقيقة ·{" "}
                    <span
                      className={
                        s.status === "open" ? "text-brand-300" : "text-amber-300"
                      }
                    >
                      {s.status === "open" ? "متاح" : s.status === "booked" ? "محجوز" : "مغلق"}
                    </span>
                  </p>
                </div>
                {s.status !== "booked" && (
                  <button
                    onClick={() => removeSlot(s.id)}
                    disabled={busy === s.id}
                    className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
                  >
                    {busy === s.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Bookings */}
      <section className="card-surface p-6">
        <h2 className="text-lg font-semibold text-white">
          الحجوزات ({bookings.length})
        </h2>
        {bookings.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">لا توجد حجوزات بعد.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-white/5 bg-ink-900/40 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{b.company_name}</p>
                    <p className="text-xs text-slate-400">
                      {b.contact_name} ·{" "}
                      {b.meeting_type ? TYPE_LABEL[b.meeting_type] ?? b.meeting_type : "—"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] ${
                      b.status === "confirmed"
                        ? "bg-brand-500/15 text-brand-200"
                        : b.status === "cancelled"
                        ? "bg-red-500/15 text-red-300"
                        : "bg-white/5 text-slate-400"
                    }`}
                  >
                    {b.status === "confirmed"
                      ? "مؤكّد"
                      : b.status === "cancelled"
                      ? "ملغى"
                      : "معلّق"}
                  </span>
                </div>
                <div className="mt-2 grid gap-1 text-xs text-slate-500 sm:grid-cols-2" dir="ltr">
                  <span>📅 {b.slot ? fmt(b.slot.starts_at) : "—"}</span>
                  <span>✉️ {b.email}</span>
                  {b.phone && <span>📞 {b.phone}</span>}
                </div>
                {b.message && (
                  <p className="mt-2 text-xs text-slate-400" dir="auto">
                    {b.message}
                  </p>
                )}
                {b.status !== "cancelled" && (
                  <div className="mt-3 flex gap-2">
                    {b.status !== "confirmed" && (
                      <button
                        onClick={() => setBooking(b.id, "confirmed")}
                        disabled={busy === b.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-500/15 px-3 py-1.5 text-xs text-brand-200 transition hover:bg-brand-500/25"
                      >
                        <Check className="h-3.5 w-3.5" /> تأكيد
                      </button>
                    )}
                    <button
                      onClick={() => setBooking(b.id, "cancelled")}
                      disabled={busy === b.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      <X className="h-3.5 w-3.5" /> إلغاء
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
