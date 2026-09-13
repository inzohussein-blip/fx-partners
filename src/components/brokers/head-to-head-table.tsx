import { Link } from "@/i18n/navigation";
import { Stars } from "@/components/brokers/stars";
import { BrokerBadges } from "@/components/brokers/broker-badges";
import {
  statusLabel,
  linkHref,
  regulatorMeta,
  isRated,
  type Broker,
} from "@/lib/brokers";
import { Building2, ExternalLink, ArrowRight, BadgeCheck } from "lucide-react";

function bestCommission(b: Broker) {
  return (
    (b.broker_links ?? []).find((l) => l.agent_commission)?.agent_commission ??
    null
  );
}
function bestBenefits(b: Broker) {
  return (
    (b.broker_links ?? []).find((l) => l.client_benefits)?.client_benefits ??
    null
  );
}
function refUrl(b: Broker) {
  const l = (b.broker_links ?? [])[0];
  return l ? linkHref(l) : null;
}

function LicenseList({ licenses }: { licenses?: string[] }) {
  const list = (licenses ?? []).map((k) => regulatorMeta(k)).filter(Boolean);
  if (list.length === 0) return null;
  return (
    <span className="inline-flex flex-wrap justify-center gap-1">
      {list.map((r, i) => (
        <span key={i} className="text-emerald-300">
          {r!.flag} {r!.label}
        </span>
      ))}
    </span>
  );
}

function Head({ b, win }: { b: Broker; win?: boolean }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-fg/5">
        {b.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            loading="lazy"
            decoding="async"
            src={b.logo_url}
            alt={b.name}
            className="h-full w-full rounded-2xl object-contain p-1.5"
          />
        ) : (
          <Building2 className="h-7 w-7 text-brand-300" />
        )}
      </div>
      <Link
        href={`/brokers/${b.slug}`}
        className="mt-3 block text-lg font-bold text-fg hover:text-brand-200"
      >
        {b.name}
      </Link>
      <div className="mt-1 flex items-center justify-center gap-1.5">
        <Stars value={b.rating} />
        <span className="text-xs text-slate-500" dir="ltr">
          {b.rating.toFixed(1)}
        </span>
      </div>
      {win && (
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs sm:text-[11px] text-emerald-300">
          <BadgeCheck className="h-3 w-3" /> الأعلى تقييماً
        </span>
      )}
    </div>
  );
}

function Row({
  label,
  a,
  b,
  winA,
  winB,
}: {
  label: string;
  a: React.ReactNode;
  b: React.ReactNode;
  winA?: boolean;
  winB?: boolean;
}) {
  const cell = (val: React.ReactNode, win?: boolean) => (
    <div
      className={`rounded-xl px-4 py-3 text-center text-sm ${
        win ? "bg-brand-500/10 font-semibold text-brand-100" : "text-slate-300"
      }`}
    >
      {val || <span className="text-slate-600">—</span>}
    </div>
  );
  return (
    <div className="grid grid-cols-[1fr_2fr] items-center gap-3 sm:grid-cols-[1fr_1.4fr_1.4fr]">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="grid grid-cols-2 gap-3 sm:contents">
        {cell(a, winA)}
        {cell(b, winB)}
      </div>
    </div>
  );
}

/**
 * Side-by-side comparison of two brokers.
 *
 * Lifted out of the /compare/vs page so the per-pair routes can render the
 * identical table — a second copy would have drifted the moment a row was
 * added to one of them.
 */
export function HeadToHeadTable({ a, b }: { a: Broker; b: Broker }) {
  return (
    <div className="card-surface p-6 sm:p-8">
      {/* Heads */}
      <div className="grid grid-cols-[1fr_2fr] gap-3 sm:grid-cols-[1fr_1.4fr_1.4fr]">
        <div />
        <div className="grid grid-cols-2 gap-3 sm:contents">
          <Head b={a} win={isRated(a) && a.rating > b.rating} />
          <Head b={b} win={isRated(b) && b.rating > a.rating} />
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <Row
          label="الحالة"
          a={
            <span
              className={a.status === "partnered" ? "text-emerald-300" : ""}
            >
              {statusLabel(a.status)}
            </span>
          }
          b={
            <span
              className={b.status === "partnered" ? "text-emerald-300" : ""}
            >
              {statusLabel(b.status)}
            </span>
          }
          winA={a.status === "partnered" && b.status !== "partnered"}
          winB={b.status === "partnered" && a.status !== "partnered"}
        />
        <Row
          label="التقييم"
          a={isRated(a) ? <span dir="ltr">{a.rating.toFixed(1)} / 5</span> : null}
          b={isRated(b) ? <span dir="ltr">{b.rating.toFixed(1)} / 5</span> : null}
          winA={isRated(a) && a.rating > b.rating}
          winB={isRated(b) && b.rating > a.rating}
        />
        <Row
          label="عدد المراجعات"
          a={<span dir="ltr">{a.reviews_count}</span>}
          b={<span dir="ltr">{b.reviews_count}</span>}
          winA={a.reviews_count > b.reviews_count}
          winB={b.reviews_count > a.reviews_count}
        />
        <Row
          label="السبريد من"
          a={a.spread_from != null ? `${a.spread_from} نقطة` : null}
          b={b.spread_from != null ? `${b.spread_from} نقطة` : null}
          winA={(a.spread_from ?? Infinity) < (b.spread_from ?? Infinity)}
          winB={(b.spread_from ?? Infinity) < (a.spread_from ?? Infinity)}
        />
        <Row label="الرافعة القصوى" a={a.leverage_max} b={b.leverage_max} />
        <Row label="بونص الإيداع" a={a.deposit_bonus} b={b.deposit_bonus} />
        <Row label="البونص الترحيبي" a={a.welcome_bonus} b={b.welcome_bonus} />
        <Row
          label="التراخيص"
          a={<LicenseList licenses={a.licenses} />}
          b={<LicenseList licenses={b.licenses} />}
        />
        <Row label="عمولة الوكيل" a={bestCommission(a)} b={bestCommission(b)} />
        <Row label="مميزات العميل" a={bestBenefits(a)} b={bestBenefits(b)} />
        <Row
          label="الشارات"
          a={<BrokerBadges badges={a.badges} />}
          b={<BrokerBadges badges={b.badges} />}
        />
      </div>

      {/* CTAs */}
      <div className="mt-8 grid grid-cols-[1fr_2fr] gap-3 sm:grid-cols-[1fr_1.4fr_1.4fr]">
        <div />
        <div className="grid grid-cols-2 gap-3 sm:contents">
          {[a, b].map((brk) => {
            const url = refUrl(brk);
            return url ? (
              <a
                key={brk.id}
                href={url}
                target="_blank"
                rel="nofollow noopener noreferrer sponsored"
                className="btn-gradient inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
              >
                فتح حساب {brk.name}
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <Link
                key={brk.id}
                href={`/brokers/${brk.slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-fg/10 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-fg/5"
              >
                تفاصيل {brk.name}
                <ArrowRight className="h-4 w-4" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
