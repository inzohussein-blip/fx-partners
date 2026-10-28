import { PageHeader } from "@/components/dashboard/page-header";
import { CandlestickChart } from "lucide-react";
import { TradingViewWidget } from "@/components/tradingview-widget";
import { setRequestLocale } from "next-intl/server";
import { TV_BASE as BASE, CALENDAR_COUNTRIES, tickerSymbols } from "@/lib/tradingview";

export default async function MarketsNewsPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  setRequestLocale(locale);
  return (
    <div className="space-y-6">
      <PageHeader
        icon={CandlestickChart}
        title={"الأسواق والأخبار"}
        subtitle={"التقويم الاقتصادي والأخبار المؤثّرة على حركة العملات — محدّثة لحظياً."}
      />

      {/* Ticker tape */}
      <div className="card-surface overflow-hidden p-2">
        <TradingViewWidget
          scriptSrc={`${BASE}/embed-widget-ticker-tape.js`}
          height={46}
          config={{
            symbols: tickerSymbols(locale),
            showSymbolLogo: true,
            isTransparent: true,
            displayMode: "adaptive",
          }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Economic calendar */}
        <section className="card-surface p-4">
          <h2 className="mb-3 text-lg font-semibold text-fg">
            التقويم الاقتصادي
          </h2>
          <TradingViewWidget
            scriptSrc={`${BASE}/embed-widget-events.js`}
            height={560}
            config={{
              isTransparent: true,
              width: "100%",
              height: "100%",
              importanceFilter: "0,1",
              countryFilter: CALENDAR_COUNTRIES,
            }}
          />
        </section>

        {/* Market news */}
        <section className="card-surface p-4">
          <h2 className="mb-3 text-lg font-semibold text-fg">أخبار الأسواق</h2>
          <TradingViewWidget
            scriptSrc={`${BASE}/embed-widget-timeline.js`}
            height={560}
            config={{
              isTransparent: true,
              width: "100%",
              height: "100%",
              feedMode: "market",
              market: "forex",
              displayMode: "regular",
            }}
          />
        </section>
      </div>

      <p className="text-center text-xs text-slate-600">
        الأدوات مقدّمة من TradingView لأغراض إعلامية، وليست نصيحة استثمارية.
      </p>
    </div>
  );
}
