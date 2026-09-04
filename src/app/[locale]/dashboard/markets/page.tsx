import { TradingViewWidget } from "@/components/tradingview-widget";

const BASE = "https://s3.tradingview.com/external-embedding";

export default function MarketsNewsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">الأسواق والأخبار</h1>
        <p className="mt-1 text-sm text-slate-400">
          التقويم الاقتصادي والأخبار المؤثّرة على حركة العملات — محدّثة لحظياً.
        </p>
      </header>

      {/* Ticker tape */}
      <div className="card-surface overflow-hidden p-2">
        <TradingViewWidget
          scriptSrc={`${BASE}/embed-widget-ticker-tape.js`}
          height={46}
          config={{
            symbols: [
              { proName: "FX_IDC:EURUSD", title: "EUR/USD" },
              { proName: "OANDA:XAUUSD", title: "الذهب" },
              { proName: "FX_IDC:GBPUSD", title: "GBP/USD" },
              { proName: "FX_IDC:USDJPY", title: "USD/JPY" },
              { proName: "BINANCE:BTCUSDT", title: "BTC" },
            ],
            showSymbolLogo: true,
            colorTheme: "dark",
            isTransparent: true,
            displayMode: "adaptive",
            locale: "ar",
          }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Economic calendar */}
        <section className="card-surface p-4">
          <h2 className="mb-3 text-lg font-semibold text-white">
            التقويم الاقتصادي
          </h2>
          <TradingViewWidget
            scriptSrc={`${BASE}/embed-widget-events.js`}
            height={560}
            config={{
              colorTheme: "dark",
              isTransparent: true,
              width: "100%",
              height: "100%",
              locale: "ar",
              importanceFilter: "0,1",
              countryFilter: "us,eu,gb,jp,ca,au,ch,cn",
            }}
          />
        </section>

        {/* Market news */}
        <section className="card-surface p-4">
          <h2 className="mb-3 text-lg font-semibold text-white">أخبار الأسواق</h2>
          <TradingViewWidget
            scriptSrc={`${BASE}/embed-widget-timeline.js`}
            height={560}
            config={{
              colorTheme: "dark",
              isTransparent: true,
              width: "100%",
              height: "100%",
              locale: "ar",
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
