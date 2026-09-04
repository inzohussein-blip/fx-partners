import { TradingViewWidget } from "@/components/tradingview-widget";

/** Full-width live ticker tape for the top of the marketing site. */
export function MarketTicker() {
  return (
    <div className="border-b border-white/5 bg-ink-900/80">
      <TradingViewWidget
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
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
  );
}
