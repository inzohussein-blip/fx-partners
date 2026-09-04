import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { MarketChart } from "@/components/marketing/market-chart";

export function Markets() {
  const t = useTranslations("Markets");

  return (
    <section id="markets" className="py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
            </span>
            {t("badge")}
          </span>
          <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
            {t("heading")}
          </h2>
          <p className="mt-4 text-slate-400">{t("subheading")}</p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl">
          <MarketChart />
          <p className="mt-3 text-center text-xs text-slate-600">
            {t("disclaimer")}
          </p>
        </div>
      </Container>
    </section>
  );
}
