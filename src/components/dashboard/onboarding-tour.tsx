"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";

const STORAGE_KEY = "fx_tour_done_v1";

type Step = {
  selector: string;
  title: string;
  text: string;
};

const STEPS: Step[] = [
  {
    selector: '[data-tour="overview"]',
    title: "أهلاً بك في FX Partners 👋",
    text: "هذه لوحتك. من النظرة العامة تتابع أرباحك وحجم تداولك وإحالاتك ومستواك.",
  },
  {
    selector: '[data-tour="marketing"]',
    title: "انسخ رابط إحالتك",
    text: "من أدوات التسويق تنسخ رابط الإحالة الخاص بك وتحمّل البانرات الجاهزة لمشاركتها.",
  },
  {
    selector: '[data-tour="wallet"]',
    title: "أرباحك وسحوباتك",
    text: "تابع رصيدك القابل للسحب واطلب السحب بأكثر من طريقة دفع من هنا.",
  },
  {
    selector: '[data-tour="leaderboard"]',
    title: "نافس الأفضل",
    text: "شاهد ترتيبك بين أفضل الوكلاء وارتقِ في المستويات لزيادة نسبة عمولتك.",
  },
  {
    selector: '[data-tour="search"]',
    title: "تنقّل بسرعة",
    text: "اضغط ⌘K في أي وقت للوصول السريع إلى أي صفحة أو أداة.",
  },
];

type Rect = { top: number; left: number; width: number; height: number };

function readDone(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function OnboardingTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  // Start once, only for first-time visitors, after layout settles.
  useEffect(() => {
    if (readDone()) return;
    const t = setTimeout(() => {
      if (document.querySelector(STEPS[0].selector)) setActive(true);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  const finish = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setActive(false);
  }, []);

  // Advance past any step whose target is missing.
  const measure = useCallback(() => {
    if (!active) return;
    let i = step;
    let el: Element | null = null;
    while (i < STEPS.length) {
      el = document.querySelector(STEPS[i].selector);
      if (el) break;
      i++;
    }
    if (!el) {
      finish();
      return;
    }
    if (i !== step) setStep(i);
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [active, step, finish]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    if (!active) return;
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [active, measure]);

  // Allow re-triggering the tour from elsewhere via a custom event.
  useEffect(() => {
    const handler = () => {
      setStep(0);
      setActive(true);
    };
    window.addEventListener("fx:start-tour", handler);
    return () => window.removeEventListener("fx:start-tour", handler);
  }, []);

  if (!active || !rect) return null;

  const pad = 8;
  const holeTop = rect.top - pad;
  const holeLeft = rect.left - pad;
  const holeW = rect.width + pad * 2;
  const holeH = rect.height + pad * 2;

  // Place the tooltip below the target when there's room, else above.
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const below = holeTop + holeH + 180 < vh;
  const tipTop = below ? holeTop + holeH + 10 : Math.max(10, holeTop - 170);
  const tipLeft = Math.min(
    Math.max(10, holeLeft),
    (typeof window !== "undefined" ? window.innerWidth : 400) - 330
  );

  const isLast = step === STEPS.length - 1;
  const s = STEPS[step];

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      {/* Spotlight cutout via a giant box-shadow around the hole. */}
      <div
        className="pointer-events-none absolute rounded-xl ring-2 ring-brand-400/70 transition-all duration-300"
        style={{
          top: holeTop,
          left: holeLeft,
          width: holeW,
          height: holeH,
          boxShadow: "0 0 0 9999px rgba(2,6,18,0.78)",
        }}
      />

      {/* Tooltip */}
      <div
        className="absolute w-[320px] rounded-2xl border border-white/10 bg-ink-800 p-5 shadow-2xl"
        style={{ top: tipTop, left: tipLeft }}
        dir="rtl"
      >
        <button
          onClick={finish}
          aria-label="إغلاق"
          className="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-brand-300">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold">جولة سريعة</span>
        </div>
        <h3 className="mt-2 text-base font-bold text-white">{s.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{s.text}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-5 bg-brand-400" : "w-1.5 bg-white/15"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={finish}
              className="rounded-lg px-2.5 py-1.5 text-xs text-slate-500 transition hover:text-white"
            >
              تخطّي
            </button>
            <button
              onClick={() => (isLast ? finish() : setStep((n) => n + 1))}
              className="rounded-lg bg-brand-gradient px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
            >
              {isLast ? "تم" : "التالي"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
