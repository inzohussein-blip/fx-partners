import { Link } from "@/i18n/navigation";
import { linkHref, type Broker } from "@/lib/brokers";
import { Check, ArrowLeft } from "lucide-react";

type Feature = {
  key: keyof Broker;
  label: string;
};

// Boolean operational features shown as ✓ / ✗ per broker.
const FEATURES: Feature[] = [
  { key: "supports_ea", label: "التداول الآلي (EA)" },
  { key: "allows_hedging", label: "التحوّط (Hedging)" },
  { key: "swap_free", label: "حساب إسلامي (Swap-Free)" },
  { key: "allows_scalping", label: "السكالبينج" },
  { key: "supports_gold", label: "تداول الذهب" },
  { key: "bonus_no_deposit", label: "بونص بدون إيداع" },
];

/**
 * ✓ when the feature is recorded as offered, a dash otherwise.
 *
 * The columns default to false, and a false here has always meant "nobody has
 * entered this yet" rather than "the broker does not offer it". Drawing it as
 * ✗ told visitors that XM, say, has no Islamic account — a claim about a real
 * company the site had never made. So only a recorded yes is drawn as a fact.
 */
function YesNo({ on }: { on: boolean }) {
  return on ? (
    <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
      <Check className="h-3.5 w-3.5" aria-label="نعم" />
    </span>
  ) : (
    <span className="text-slate-600" title="لم يُتحقَّق بعد" aria-label="لم يُتحقَّق بعد">
      —
    </span>
  );
}

/** Whether a broker has anything this grid would show beyond dashes. */
function hasSpecs(b: Broker): boolean {
  return (
    FEATURES.some((f) => Boolean(b[f.key])) ||
    b.min_deposit != null ||
    (b.deposit_methods?.length ?? 0) > 0
  );
}

/** The grid is worth rendering only when at least one broker has specs. */
export function anySpecs(brokers: Broker[]): boolean {
  return brokers.some(hasSpecs);
}

/** Quick operational-specs comparison grid: brokers × features (✓/✗). */
export function SpecsGrid({ brokers }: { brokers: Broker[] }) {
  if (!anySpecs(brokers)) return null;
  // Brokers with recorded specs first; the rest only fill remaining columns.
  const cols = [...brokers.filter(hasSpecs), ...brokers.filter((b) => !hasSpecs(b))].slice(0, 6);

  return (
    <div className="overflow-x-auto rounded-2xl border border-fg/[0.06]">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky end-0 z-10 min-w-[150px] border-b border-s border-fg/5 bg-ink-800 p-3 text-start text-slate-400">
              الخاصية
            </th>
            {cols.map((b) => (
              <th
                key={b.id}
                className="min-w-[120px] border-b border-fg/5 p-3 text-center"
              >
                <Link href={`/brokers/${b.slug}`} className="inline-flex flex-col items-center gap-1.5 hover:text-brand-300">
                  {b.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.logo_url}
                      alt={b.name}
                      loading="lazy"
                      decoding="async"
                      className="h-8 w-8 rounded-lg border border-fg/10 bg-white object-contain p-0.5"
                    />
                  ) : (
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-fg/5 text-xs font-black text-brand-300">
                      {b.name.charAt(0)}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-fg">{b.name}</span>
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FEATURES.map((f) => (
            <tr key={String(f.key)} className="transition-colors hover:bg-fg/[0.02]">
              <td className="sticky end-0 z-10 border-b border-s border-fg/5 bg-ink-800 p-3 font-medium text-slate-300">
                {f.label}
              </td>
              {cols.map((b) => (
                <td key={b.id} className="border-b border-fg/5 p-3 text-center">
                  <YesNo on={Boolean(b[f.key])} />
                </td>
              ))}
            </tr>
          ))}

          {/* Min deposit */}
          <tr className="transition-colors hover:bg-fg/[0.02]">
            <td className="sticky end-0 z-10 border-b border-s border-fg/5 bg-ink-800 p-3 font-medium text-slate-300">
              أقل إيداع
            </td>
            {cols.map((b) => (
              <td key={b.id} dir="ltr" className="border-b border-fg/5 p-3 text-center text-fg">
                {b.min_deposit != null ? `$${b.min_deposit}` : "—"}
              </td>
            ))}
          </tr>

          {/* Deposit methods */}
          <tr className="transition-colors hover:bg-fg/[0.02]">
            <td className="sticky end-0 z-10 border-b border-s border-fg/5 bg-ink-800 p-3 font-medium text-slate-300">
              طرق الإيداع
            </td>
            {cols.map((b) => (
              <td key={b.id} className="border-b border-fg/5 p-3 text-center">
                {b.deposit_methods && b.deposit_methods.length ? (
                  <div className="flex flex-wrap justify-center gap-1">
                    {b.deposit_methods.map((m) => (
                      <span key={m} className="rounded-full bg-brand-500/10 px-2 py-0.5 text-xs sm:text-[11px] text-brand-200">
                        {m}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-600">—</span>
                )}
              </td>
            ))}
          </tr>

          {/* CTA row */}
          <tr>
            <td className="sticky end-0 z-10 border-s border-fg/5 bg-ink-800 p-3" />
            {cols.map((b) => {
              const link = b.broker_links?.[0];
              return (
                <td key={b.id} className="p-3 text-center">
                  <Link
                    href={link ? linkHref(link) : `/brokers/${b.slug}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-gradient px-3 py-2 text-xs font-semibold text-white shadow-glow transition hover:opacity-90"
                  >
                    {link ? "فتح حساب" : "التفاصيل"}
                    <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-0 ltr:rotate-180" />
                  </Link>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
