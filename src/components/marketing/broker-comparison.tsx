"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Users,
  BarChart3,
  Building2,
  ArrowLeft,
  ArrowRight,
  Check,
  TrendingUp,
  Sparkles,
} from "lucide-react";

// FX Partners auto-tier by monthly lot volume (illustrative $/lot).
const FX_TIERS = [
  { min: 0, perLot: 6, label: "مبتدئ" },
  { min: 100, perLot: 8, label: "ذهبي" },
  { min: 500, perLot: 10, label: "VIP" },
];

function fxTierFor(volume: number) {
  let t = FX_TIERS[0];
  for (const tier of FX_TIERS) if (volume >= tier.min) t = tier;
  return t;
}

const schema = z.object({
  clients: z.coerce.number().min(1, "أدخل عدداً صحيحاً").max(100000),
  lotsPerClient: z.coerce.number().min(0.1, "أدخل قيمة صحيحة").max(1000),
  competitorPerLot: z.coerce.number().min(0, "لا يمكن أن يكون سالباً").max(100),
  payoutDelayDays: z.coerce.number().min(0).max(120),
});

type FormValues = z.infer<typeof schema>;

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const STEPS = [
  { title: "نشاطك", icon: Users },
  { title: "وسيطك الحالي", icon: Building2 },
  { title: "المقارنة", icon: BarChart3 },
] as const;

const STEP_FIELDS: (keyof FormValues)[][] = [
  ["clients", "lotsPerClient"],
  ["competitorPerLot", "payoutDelayDays"],
  [],
];

export function BrokerComparison() {
  const [step, setStep] = useState(0);
  const {
    register,
    trigger,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      clients: 20,
      lotsPerClient: 8,
      competitorPerLot: 4,
      payoutDelayDays: 30,
    },
  });

  const values = watch();

  const result = useMemo(() => {
    const volume = (Number(values.clients) || 0) * (Number(values.lotsPerClient) || 0);
    const tier = fxTierFor(volume);
    const fxMonthly = volume * tier.perLot;
    const compMonthly = volume * (Number(values.competitorPerLot) || 0);
    const diffMonthly = fxMonthly - compMonthly;
    const pct = compMonthly > 0 ? (diffMonthly / compMonthly) * 100 : 100;
    return {
      volume,
      tier,
      fxMonthly,
      compMonthly,
      fxYearly: fxMonthly * 12,
      compYearly: compMonthly * 12,
      diffMonthly,
      diffYearly: diffMonthly * 12,
      pct,
    };
  }, [values]);

  async function next() {
    const ok = await trigger(STEP_FIELDS[step]);
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none";

  return (
    <section id="comparison" className="py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            <Sparkles className="h-3.5 w-3.5" />
            كم ستربح أكثر معنا؟
          </span>
          <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
            قارن عمولتك خلال 3 خطوات
          </h2>
          <p className="mt-4 text-slate-400">
            أدخل أرقامك الحقيقية وشاهد الفرق بين FX Partners ووسيطك الحالي — لحظياً.
          </p>
        </div>

        {/* Stepper */}
        <div className="mx-auto mt-10 flex max-w-xl items-center">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            const Icon = s.icon;
            return (
              <div key={s.title} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-full border transition",
                      active
                        ? "border-brand-400 bg-brand-500/20 text-brand-200"
                        : done
                        ? "border-brand-500/40 bg-brand-500/15 text-brand-300"
                        : "border-white/10 bg-white/5 text-slate-500"
                    )}
                  >
                    {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span
                    className={cn(
                      "text-xs",
                      active || done ? "text-slate-200" : "text-slate-500"
                    )}
                  >
                    {s.title}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 flex-1 rounded-full transition",
                      done ? "bg-brand-500/50" : "bg-white/10"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="card-surface mx-auto mt-8 max-w-2xl p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      عدد العملاء النشطين لديك
                    </label>
                    <input
                      type="number"
                      dir="ltr"
                      className={inputCls}
                      {...register("clients")}
                    />
                    {errors.clients && (
                      <p className="mt-1.5 text-xs text-red-400">
                        {errors.clients.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      متوسط اللوتات الشهرية لكل عميل
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      dir="ltr"
                      className={inputCls}
                      {...register("lotsPerClient")}
                    />
                    {errors.lotsPerClient && (
                      <p className="mt-1.5 text-xs text-red-400">
                        {errors.lotsPerClient.message}
                      </p>
                    )}
                  </div>
                  <div className="rounded-xl border border-white/5 bg-ink-900/40 p-4 text-sm text-slate-400">
                    الحجم الشهري التقديري:{" "}
                    <span dir="ltr" className="font-bold text-brand-300">
                      {result.volume.toLocaleString("en-US")} لوت
                    </span>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      عمولة وسيطك الحالي لكل لوت (بالدولار)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      dir="ltr"
                      className={inputCls}
                      {...register("competitorPerLot")}
                    />
                    {errors.competitorPerLot && (
                      <p className="mt-1.5 text-xs text-red-400">
                        {errors.competitorPerLot.message}
                      </p>
                    )}
                    <p className="mt-1.5 text-xs text-slate-600">
                      اتركها صفراً إن كنت لا تعمل مع أي وسيط بعد.
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      مدة انتظار صرف عمولتك الحالية (بالأيام)
                    </label>
                    <input
                      type="number"
                      dir="ltr"
                      className={inputCls}
                      {...register("payoutDelayDays")}
                    />
                    {errors.payoutDelayDays && (
                      <p className="mt-1.5 text-xs text-red-400">
                        {errors.payoutDelayDays.message}
                      </p>
                    )}
                    <p className="mt-1.5 text-xs text-slate-600">
                      نحن نصرف خلال 24 ساعة عبر أكثر من طريقة دفع.
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* FX Partners */}
                    <div className="relative overflow-hidden rounded-2xl border border-brand-500/30 p-5">
                      <div className="hero-glow absolute inset-0 opacity-60" />
                      <div className="relative">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">
                            FX Partners
                          </span>
                          <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] text-brand-200">
                            مستوى {result.tier.label}
                          </span>
                        </div>
                        <div className="mt-3 text-xs text-slate-400">شهرياً</div>
                        <div
                          dir="ltr"
                          className="text-3xl font-extrabold text-gradient"
                        >
                          {usd.format(result.fxMonthly)}
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          سنوياً{" "}
                          <span dir="ltr" className="text-slate-300">
                            {usd.format(result.fxYearly)}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-brand-300">
                          <Check className="h-3.5 w-3.5" /> صرف خلال 24 ساعة
                        </div>
                      </div>
                    </div>

                    {/* Competitor */}
                    <div className="rounded-2xl border border-white/10 bg-ink-900/40 p-5">
                      <span className="text-sm font-bold text-slate-300">
                        وسيطك الحالي
                      </span>
                      <div className="mt-3 text-xs text-slate-500">شهرياً</div>
                      <div dir="ltr" className="text-3xl font-extrabold text-slate-300">
                        {usd.format(result.compMonthly)}
                      </div>
                      <div className="mt-2 text-xs text-slate-600">
                        سنوياً{" "}
                        <span dir="ltr">{usd.format(result.compYearly)}</span>
                      </div>
                      <div className="mt-3 text-xs text-slate-600">
                        صرف خلال{" "}
                        <span dir="ltr">{Number(values.payoutDelayDays) || 0}</span> يوم
                      </div>
                    </div>
                  </div>

                  {/* Verdict */}
                  <div className="rounded-2xl border border-brand-500/25 bg-brand-500/10 p-5 text-center">
                    {result.diffMonthly > 0 ? (
                      <>
                        <div className="flex items-center justify-center gap-2 text-brand-200">
                          <TrendingUp className="h-5 w-5" />
                          <span className="text-sm">أرباح إضافية معنا</span>
                        </div>
                        <div
                          dir="ltr"
                          className="mt-2 text-3xl font-extrabold text-gradient"
                        >
                          +{usd.format(result.diffMonthly)} / شهر
                        </div>
                        <div className="mt-1 text-sm text-slate-300">
                          أي{" "}
                          <span dir="ltr" className="font-bold text-brand-300">
                            +{usd.format(result.diffYearly)}
                          </span>{" "}
                          سنوياً
                          {isFinite(result.pct) && result.pct > 0 && (
                            <>
                              {" "}
                              (
                              <span dir="ltr">+{Math.round(result.pct)}%</span>)
                            </>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-slate-300">
                        عمولتك الحالية قريبة من عرضنا — لكن مع FX Partners تحصل على صرف
                        خلال 24 ساعة، أدوات تسويق، وترقية تلقائية للمستوى.
                      </div>
                    )}
                  </div>

                  <Button href="/login" className="w-full">
                    ابدأ الشراكة الآن مجاناً
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              disabled={step === 0}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition",
                step === 0
                  ? "cursor-not-allowed text-slate-600"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <ArrowRight className="h-4 w-4" />
              السابق
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
              >
                التالي
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(0)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:text-white"
              >
                إعادة الحساب
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-600">
          الأرقام تقديرية لأغراض التوضيح، وقد تختلف حسب الأدوات وشروط البرنامج.
        </p>
      </Container>
    </section>
  );
}
