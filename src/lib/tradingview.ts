/**
 * Shared settings for TradingView's free embeddable widgets.
 *
 * Terms: free on public pages for display only, with TradingView's
 * attribution link left visible (TradingViewWidget always renders it). Never
 * scrape or store what the widgets show.
 */
export const TV_BASE = "https://s3.tradingview.com/external-embedding";

/** TradingView's own locale codes: Arabic is region-qualified. */
export function tvLocale(locale: string): string {
  return locale === "ar" ? "ar_AE" : "en";
}

/** Majors, gold and bitcoin — what this site's readers trade most. */
export const TV_SYMBOLS = [
  { proName: "FX_IDC:EURUSD", ar: "EUR/USD", en: "EUR/USD" },
  { proName: "FX_IDC:GBPUSD", ar: "GBP/USD", en: "GBP/USD" },
  { proName: "FX_IDC:USDJPY", ar: "USD/JPY", en: "USD/JPY" },
  { proName: "OANDA:XAUUSD", ar: "الذهب", en: "Gold" },
  { proName: "TVC:USOIL", ar: "النفط", en: "Oil" },
  { proName: "BITSTAMP:BTCUSD", ar: "بيتكوين", en: "Bitcoin" },
] as const;

export function tickerSymbols(locale: string) {
  return TV_SYMBOLS.map((s) => ({ proName: s.proName, title: locale === "ar" ? s.ar : s.en }));
}

/** Symbol-overview widget wants [label, "EXCHANGE:SYMBOL|range"] pairs. */
export function overviewSymbols(locale: string) {
  return TV_SYMBOLS.map((s) => [locale === "ar" ? s.ar : s.en, `${s.proName}|1D`]);
}

/** Currencies of the eight majors plus China, for the economic calendar. */
export const CALENDAR_COUNTRIES = "us,eu,gb,jp,ca,au,nz,ch,cn";
