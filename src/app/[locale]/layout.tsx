import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Cairo } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { AdminEditProvider } from "@/components/admin-edit/provider";
import { getSiteUrl } from "@/lib/utils";
import {
  LiveCampaignBanner,
  type Campaign,
} from "@/components/marketing/live-campaign-banner";
import { createClient } from "@/lib/supabase/server";
import { SkipLink } from "@/components/skip-link";
import { ServiceWorkerRegister } from "@/components/service-worker";
import { OrganizationJsonLd } from "@/components/organization-jsonld";
import { ThemeProvider } from "@/components/theme-provider";
import { ConsentProvider } from "@/components/consent/provider";
import { ConsentBanner } from "@/components/consent/banner";
import { GatedAnalytics } from "@/components/consent/gated-analytics";
import "../globals.css";

// Cairo carries both Arabic (primary language) and Latin/numbers — a single,
// consistent type voice across the whole site.
//
// Two subsets, and both are load-bearing: `arabic` (30kB) for the copy, and
// `latin` (33kB) for the digits, currency symbols and the ~150 `dir="ltr"`
// spans — broker names, spreads, leverage ratios — that a comparison site is
// made of. The browser skips `latin-ext` on its own via unicode-range, so it
// is never fetched. Pinning explicit weights was measured and is worse here:
// the design uses 400/500/600/700/800, and static instances would mean ten
// files instead of these two variable ones.
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  // One per scheme, so the browser chrome matches the theme the visitor is
  // actually seeing instead of always painting the dark navy.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#01070f" },
  ],
  colorScheme: "light dark",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const ogImage = `${getSiteUrl()}/api/banner?size=wide`;
  // No `alternates` here on purpose. Metadata inherits down the tree, so a
  // canonical set on the layout is inherited by every page that does not
  // declare its own — which pointed the whole site at the homepage and told
  // Google that /compare, /tools and the rest were duplicates of "/".
  // Each page now declares its own canonical via pageMeta().
  return {
    title: { default: t("title"), template: "%s | FX Partners" },
    description: t("description"),
    metadataBase: new URL(getSiteUrl()),
    openGraph: {
      type: "website",
      url: locale === "ar" ? "/" : "/en",
      siteName: "FX Partners",
      locale: locale === "ar" ? "ar_AR" : "en_US",
      title: t("title"),
      description: t("description"),
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [ogImage],
    },
  };
}

/** The active campaign, read on the server so no page ships a database client. */
async function getActiveCampaign(): Promise<Campaign | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("campaigns")
      .select("id,broker_slug,title,message,cta_label")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1);
    return (data?.[0] as Campaign) ?? null;
  } catch {
    return null;
  }
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);

  const [messages, campaign] = await Promise.all([
    getMessages(),
    getActiveCampaign(),
  ]);
  const dir = locale === "ar" ? "rtl" : "ltr";

  const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
    : null;

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${cairo.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Warm up connections to external origins used at runtime */}
        {supabaseHost && <link rel="preconnect" href={supabaseHost} crossOrigin="" />}
        <link rel="preconnect" href="https://s3.tradingview.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://s3.tradingview.com" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://api.binance.com" />

        {/* Machine-readable entry points, advertised so an agent that lands on
            any page can find the structured data without guessing at paths. */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />
        <link
          rel="alternate"
          type="application/json"
          href="/api/public/brokers"
          title="بيانات الشركات"
        />
      </head>
      <body>
        {/* The entity record belongs on every page, not just the homepage —
            a crawler that enters on a broker page should learn who publishes
            it without having to reach "/" first. */}
        <OrganizationJsonLd locale={locale} />
        <ThemeProvider>
        <NextIntlClientProvider messages={messages}>
          {/* Consent wraps everything below it, because everything below it
              that touches a third party has to ask first. */}
          <ConsentProvider>
          <ServiceWorkerRegister />
          <SkipLink />
          <div id="content">
            <AdminEditProvider>
              <NuqsAdapter>{children}</NuqsAdapter>
            </AdminEditProvider>
          </div>
          <LiveCampaignBanner initial={campaign} />
          <ConsentBanner />
          <GatedAnalytics />
          <Toaster
            theme="dark"
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: "#111c27",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#e2e8f0",
              },
            }}
          />
          </ConsentProvider>
        </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
