"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { bookMeeting } from "@/lib/actions/booking";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { CalendarClock, Check, Loader2, Video } from "lucide-react";

export type Slot = {
  id: string;
  starts_at: string;
  duration_min: number;
};

type FormValues = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  meetingType: string;
  message: string;
};

const TYPES = [
  { value: "broker", label: "شركة تداول (Broker)" },
  { value: "master_ib", label: "وكيل رئيسي (Master IB)" },
  { value: "liquidity", label: "مزوّد سيولة" },
  { value: "technology", label: "شركة تقنية مالية" },
];

function fmtDay(iso: string) {
  return new Intl.DateTimeFormat("ar", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}
function fmtTime(iso: string) {
  return new Intl.DateTimeFormat("ar", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function Booking({ slots }: { slots: Slot[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ mode: "onChange" });

  // Group upcoming slots by day for a tidy picker.
  const grouped = useMemo(() => {
    const now = Date.now();
    const upcoming = slots
      .filter((s) => new Date(s.starts_at).getTime() > now)
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    const map = new Map<string, Slot[]>();
    for (const s of upcoming) {
      const key = fmtDay(s.starts_at);
      (map.get(key) ?? map.set(key, []).get(key)!).push(s);
    }
    return Array.from(map.entries());
  }, [slots]);

  async function onSubmit(values: FormValues) {
    setServerError(null);
    if (!selected) {
      setServerError("اختر موعداً متاحاً أولاً.");
      return;
    }
    const res = await bookMeeting({ ...values, slotId: selected });
    if (res.ok) {
      setDone(true);
    } else {
      setServerError(res.error ?? "تعذّر الحجز، حاول مجدداً.");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none";

  if (done) {
    return (
      <section id="booking" className="py-20">
        <Container>
          <div className="card-surface mx-auto max-w-lg p-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-500/15 text-brand-300">
              <Check className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-2xl font-bold text-white">تم تأكيد موعدك!</h3>
            <p className="mt-3 text-slate-400">
              أرسلنا تفاصيل الاجتماع إلى بريدك الإلكتروني، وسيتواصل معك فريق
              الشراكات قبل الموعد. نتطلّع للحديث معك.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section id="booking" className="py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            <Video className="h-3.5 w-3.5" />
            اجتماع أونلاين
          </span>
          <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
            احجز مكالمة شراكة B2B
          </h2>
          <p className="mt-4 text-slate-400">
            اختر موعداً يناسبك للتحدث مع فريق الشراكات حول عقود White-label أو
            Revenue Share. المواعيد بتوقيت UTC.
          </p>
        </div>

        <div className="card-surface mt-10 grid gap-8 p-6 sm:p-8 lg:grid-cols-2">
          {/* Slot picker */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <CalendarClock className="h-4 w-4 text-brand-300" />
              المواعيد المتاحة
            </h3>

            {grouped.length === 0 ? (
              <p className="mt-6 rounded-xl border border-white/5 bg-ink-900/40 p-5 text-sm text-slate-400">
                لا توجد مواعيد متاحة حالياً. اترك بياناتك في نموذج{" "}
                <span className="text-brand-300">تواصل معنا</span> وسنعاود
                الاتصال بك لتحديد موعد.
              </p>
            ) : (
              <div className="mt-4 max-h-80 space-y-5 overflow-y-auto pe-1">
                {grouped.map(([day, daySlots]) => (
                  <div key={day}>
                    <div className="mb-2 text-xs font-medium text-slate-500">{day}</div>
                    <div className="grid grid-cols-3 gap-2">
                      {daySlots.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelected(s.id)}
                          dir="ltr"
                          className={cn(
                            "rounded-xl border px-2 py-2.5 text-sm font-semibold transition",
                            selected === s.id
                              ? "border-brand-400 bg-brand-500/20 text-brand-100"
                              : "border-white/10 bg-white/5 text-slate-300 hover:border-brand-500/40 hover:text-white"
                          )}
                        >
                          {fmtTime(s.starts_at)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm text-slate-300">اسم الشركة</label>
                <input
                  className={inputCls}
                  {...register("companyName", { required: "اسم الشركة مطلوب" })}
                />
                {errors.companyName && (
                  <p className="mt-1 text-xs text-red-400">{errors.companyName.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-slate-300">اسم المسؤول</label>
                <input
                  className={inputCls}
                  {...register("contactName", { required: "اسم المسؤول مطلوب" })}
                />
                {errors.contactName && (
                  <p className="mt-1 text-xs text-red-400">{errors.contactName.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm text-slate-300">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  dir="ltr"
                  className={inputCls}
                  {...register("email", {
                    required: "البريد مطلوب",
                    pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "بريد غير صالح" },
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-slate-300">
                  الهاتف <span className="text-slate-600">(اختياري)</span>
                </label>
                <input dir="ltr" className={inputCls} {...register("phone")} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-slate-300">نوع التعاون</label>
              <select
                className={inputCls}
                defaultValue="broker"
                {...register("meetingType")}
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-slate-300">
                رسالة <span className="text-slate-600">(اختياري)</span>
              </label>
              <textarea
                rows={3}
                className={inputCls}
                placeholder="أخبرنا باختصار عن شركتك وحجم أعمالك."
                {...register("message")}
              />
            </div>

            {serverError && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جارٍ التأكيد…
                </>
              ) : (
                <>
                  تأكيد الحجز
                  {selected && (
                    <span dir="ltr" className="opacity-80">
                      · {fmtTime(slots.find((s) => s.id === selected)!.starts_at)}
                    </span>
                  )}
                </>
              )}
            </button>
          </form>
        </div>
      </Container>
    </section>
  );
}
