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
import { getSiteUrl } from "@/lib/utils";
import { LiveCampaignBanner } from "@/components/marketing/live-campaign-banner";
import { SkipLink } from "@/components/skip-link";
import { ServiceWorkerRegister } from "@/components/service-worker";
import "../globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#060f1e",
  colorScheme: "dark",
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
  return {
    title: { default: t("title"), template: "%s | FX Partners" },
    description: t("description"),
    metadataBase: new URL(getSiteUrl()),
    alternates: {
      canonical: locale === "ar" ? "/" : "/en",
      languages: {
        ar: "/",
        en: "/en",
        "x-default": "/",
      },
    },
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

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
    : null;

  return (
    <html lang={locale} dir={dir} className={cairo.variable}>
      <head>
        {/* Warm up connections to external origins used at runtime */}
        {supabaseHost && <link rel="preconnect" href={supabaseHost} crossOrigin="" />}
        <link rel="preconnect" href="https://s3.tradingview.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://s3.tradingview.com" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://api.binance.com" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ServiceWorkerRegister />
          <SkipLink />
          <div id="content">
            <NuqsAdapter>{children}</NuqsAdapter>
          </div>
          <LiveCampaignBanner />
          <Toaster
            theme="dark"
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: "#0a1728",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#e2e8f0",
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
