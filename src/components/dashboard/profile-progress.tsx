import { Link } from "@/i18n/navigation";
import { CheckCircle2, Circle, Gift, Sparkles } from "lucide-react";

export type OnboardingStep = {
  id: string;
  label: string;
  completed: boolean;
  href?: string;
};

/**
 * Gamified onboarding progress for the IB partner: a completion bar over a
 * checklist of first-run steps, with a reward callout once everything is done.
 * Presentational — the parent computes `steps` server-side.
 */
export function ProfileProgress({ steps }: { steps: OnboardingStep[] }) {
  const done = steps.filter((s) => s.completed).length;
  const total = steps.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const complete = done === total;

  return (
    <section className="card-surface relative overflow-hidden p-6">
      <div className="hero-glow absolute inset-0 opacity-40" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
              <Sparkles className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">أكمل إعداد حسابك</h2>
              <p className="mt-0.5 text-sm text-slate-400">
                {complete
                  ? "أحسنت! أكملت كل الخطوات 🎉"
                  : `باقي ${total - done} خطوات لتفعيل حسابك بالكامل.`}
              </p>
            </div>
          </div>
          <div dir="ltr" className="text-2xl font-extrabold text-gradient">{pct}%</div>
        </div>

        {/* Progress bar */}
        <div
          className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="نسبة اكتمال الإعداد"
        >
          <div
            className="h-full rounded-full bg-brand-gradient transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Steps */}
        <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {steps.map((step) => (
            <li
              key={step.id}
              className={`flex items-center gap-3 rounded-xl p-3 transition ${
                step.completed
                  ? "bg-emerald-500/10 ring-1 ring-emerald-500/20"
                  : "bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
            >
              {step.completed ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-slate-600" aria-hidden />
              )}
              <span
                className={`flex-1 text-sm ${
                  step.completed ? "text-slate-500 line-through" : "font-medium text-white"
                }`}
              >
                {step.label}
              </span>
              {!step.completed && step.href && (
                <Link
                  href={step.href}
                  className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/5 hover:text-white"
                >
                  أكمل
                </Link>
              )}
            </li>
          ))}
        </ul>

        {complete && (
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-brand-gradient p-4 text-white shadow-glow">
            <Gift className="h-6 w-6 shrink-0" aria-hidden />
            <p className="text-sm font-semibold">
              حسابك جاهز تماماً — ابدأ بمشاركة روابطك واكسب من كل إحالة.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
