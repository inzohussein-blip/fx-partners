import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Link } from "@/i18n/navigation";
import {
  CircleDollarSign,
  Gem,
  LineChart,
  Bitcoin,
  Building2,
  Fuel,
  ArrowLeft,
} from "lucide-react";

const CLASSES = [
  { key: "forex", icon: CircleDollarSign, dir: "up" },
  { key: "metals", icon: Gem, dir: "up" },
  { key: "indices", icon: LineChart, dir: "down" },
  { key: "crypto", icon: Bitcoin, dir: "up" },
  { key: "stocks", icon: Building2, dir: "up" },
  { key: "energy", icon: Fuel, dir: "down" },
] as const;

/** Broker-style asset-class grid — the "what can I trade" strip. */
export function Instruments() {
  const t = useTranslations("Instruments");

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow={t("badge")}
          icon={CircleDollarSign}
          title={t("heading")}
          subtitle={t("subheading")}
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CLASSES.map((c) => {
            const up = c.dir === "up";
            return (
              <div
                key={c.key}
                className="card-surface group relative overflow-hidden p-6 transition hover:-translate-y-0.5 hover:ring-1 hover:ring-brand-500/30"
              >
                <div className="hero-glow absolute inset-0 opacity-0 transition group-hover:opacity-40" />
                <div className="relative flex items-center gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20 transition group-hover:bg-brand-500/20">
                    <c.icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-white">
                        {t(`${c.key}.name`)}
                      </h3>
                      <span
                        dir="ltr"
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          up
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-rose-500/10 text-rose-300"
                        }`}
                      >
                        {up ? "▲" : "▼"} {t(`${c.key}.change`)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-400">
                      {t(`${c.key}.desc`)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/brokers"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5 hover:text-white"
          >
            {t("cta")}
            <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
