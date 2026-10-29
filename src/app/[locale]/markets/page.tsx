import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta, KEYWORDS } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { TradingViewWidget } from "@/components/tradingview-widget";
import {
  TV_BASE,
  CALENDAR_COUNTRIES,
  overviewSymbols,
  tickerSymbols,
} from "@/lib/tradingview";
import { CandlestickChart } from "lucide-react";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "MarketsPage" });
  return pageMeta({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/markets",
    keywords: KEYWORDS.markets,
    locale,
  });
}

function Panel({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-fg">{title}</h2>
      {note && <p className="mt-1 text-sm text-slate-400">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * Live market data, all of it from TradingView's free widgets (see
 * lib/tradingview.ts for the terms). Every widget is consent-gated and
 * deferred by TradingViewWidget, so the page itself stays static and fast.
 */
export default async function MarketsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "MarketsPage" });

  return (
    <>
      <SiteHeader />
      <section className="py-14">
        <Container>
          <Breadcrumbs items={[{ label: t("crumb") }]} />
          <div className="mt-6">
            <SectionHeading
              as="h1"
              eyebrow={t("eyebrow")}
              icon={CandlestickChart}
              title={t("title")}
              subtitle={t("subtitle")}
              align="start"
            />
          </div>

          <div className="card-surface mt-8 overflow-hidden p-2">
            <TradingViewWidget
              scriptSrc={`${TV_BASE}/embed-widget-ticker-tape.js`}
              height={46}
              config={{
                symbols: tickerSymbols(locale),
                showSymbolLogo: true,
                isTransparent: true,
                displayMode: "adaptive",
              }}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Panel title={t("overview")}>
                <TradingViewWidget
                  scriptSrc={`${TV_BASE}/embed-widget-symbol-overview.js`}
                  height={440}
                  config={{
                    symbols: overviewSymbols(locale),
                    chartOnly: false,
                    width: "100%",
                    height: "100%",
                    autosize: true,
                    isTransparent: true,
                    showVolume: false,
                    chartType: "area",
                    lineWidth: 2,
                    dateRanges: ["1d|1", "1m|30", "3m|60", "12m|1D"],
                  }}
                />
              </Panel>
            </div>
            <Panel title={t("technical")} note={t("technicalNote")}>
              <TradingViewWidget
                scriptSrc={`${TV_BASE}/embed-widget-technical-analysis.js`}
                height={400}
                config={{
                  interval: "1h",
                  width: "100%",
                  height: "100%",
                  isTransparent: true,
                  symbol: "FX_IDC:EURUSD",
                  showIntervalTabs: true,
                  displayMode: "single",
                }}
              />
            </Panel>
          </div>

          <div className="mt-6">
            <Panel title={t("cross")}>
              <TradingViewWidget
                scriptSrc={`${TV_BASE}/embed-widget-forex-cross-rates.js`}
                height={400}
                config={{
                  width: "100%",
                  height: "100%",
                  currencies: ["EUR", "USD", "JPY", "GBP", "AUD", "CAD"],
                  isTransparent: true,
                }}
              />
            </Panel>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Panel title={t("calendar")} note={t("calendarNote")}>
              <TradingViewWidget
                scriptSrc={`${TV_BASE}/embed-widget-events.js`}
                height={560}
                config={{
                  width: "100%",
                  height: "100%",
                  isTransparent: true,
                  importanceFilter: "0,1",
                  countryFilter: CALENDAR_COUNTRIES,
                }}
              />
              <Link
                href="/indicators"
                className="mt-3 inline-block text-sm font-semibold text-brand-300 hover:text-brand-200"
              >
                {t("indicatorsLink")}
              </Link>
            </Panel>
            <Panel title={t("news")}>
              <TradingViewWidget
                scriptSrc={`${TV_BASE}/embed-widget-timeline.js`}
                height={560}
                config={{
                  width: "100%",
                  height: "100%",
                  isTransparent: true,
                  feedMode: "market",
                  market: "forex",
                  displayMode: "regular",
                }}
              />
            </Panel>
          </div>

          <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-slate-500">
            {t("disclaimer")}
          </p>

          <div className="card-surface mt-10 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-fg">{t("ctaTitle")}</h2>
              <p className="mt-1 text-sm text-slate-400">{t("ctaBody")}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/compare">{t("ctaCompare")}</Button>
              <Button href="/spreads" variant="secondary">
                {t("ctaSpreads")}
              </Button>
            </div>
          </div>
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
