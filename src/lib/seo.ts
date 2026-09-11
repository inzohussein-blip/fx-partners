import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/utils";

/**
 * Central SEO surface for the whole site.
 *
 * Everything a search engine, an AI crawler, or an autonomous agent needs to
 * understand *what FX Partners is* lives here in one place: the entity facts,
 * the keyword sets per section, and the metadata builder every page uses. One
 * source of truth means a positioning change is one edit, not thirty.
 */

/** Who we are — the entity facts, stated the same way everywhere. */
export const SITE = {
  name: "FX Partners",
  alternateName: "إف إكس بارتنرز",
  /**
   * The positioning, in one line. This is the single most important string on
   * the site for entity recognition: we are an intermediary and master IB, not
   * a broker, and every machine-readable surface must say so plainly.
   */
  tagline: {
    ar: "وسيط شراكة ووكيل ماستر (Master IB) يربط المتداولين والوكلاء بشركات التداول العالمية.",
    en: "A partnership intermediary and master IB connecting traders and agents with global brokers.",
  },
  description: {
    ar: "FX Partners ليست شركة تداول. نحن وسيط شراكة ووكيل ماستر نتعامل مع مجموعة من شركات التداول المرخّصة، ونربط المتداولين والوكلاء (IB) بها بشروط تفاوضنا عليها: مقارنة شفّافة للشركات وتراخيصها، عروض محدّثة، عمولات وكلاء واضحة، وأدوات تداول مجانية — بالعربية.",
    en: "FX Partners is not a broker. We are a partnership intermediary and master IB working with a network of licensed brokers, connecting traders and introducing brokers to them on negotiated terms: transparent broker and licence comparison, current offers, clear agent commissions, and free trading tools.",
  },
  languages: ["ar", "en"],
  /** Primary audience regions, for `areaServed` in structured data. */
  areaServed: ["IQ", "SA", "AE", "KW", "QA", "BH", "OM", "JO", "EG", "MA", "DZ", "TN", "LY", "SD", "YE", "LB", "SY", "PS"],
} as const;

/**
 * Verified profiles, read from the environment rather than hard-coded.
 *
 * `sameAs` is how a search engine ties this site to the same real-world entity
 * across the web, so a wrong or aspirational URL here actively hurts: it either
 * points at nothing or at somebody else. Set NEXT_PUBLIC_SAME_AS to a
 * comma-separated list of profiles you actually control; until then we publish
 * no `sameAs` at all, which is the honest state.
 */
export function sameAs(): string[] {
  return (process.env.NEXT_PUBLIC_SAME_AS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//.test(s));
}

/**
 * Keyword sets per section — the queries each page is genuinely the answer to.
 *
 * These feed the `keywords` meta tag and, more usefully, the llms.txt summary
 * an AI agent reads when deciding whether this site answers a user's question.
 * Keep them honest: a keyword the page does not actually serve is a bounce.
 */
export const KEYWORDS = {
  home: [
    "شركات تداول",
    "أفضل شركات التداول",
    "شركات فوركس مرخصة",
    "وسيط فوركس عربي",
    "وكيل ماستر IB",
    "شراكة فوركس",
    "forex brokers arabic",
    "master ib partnership",
  ],
  compare: [
    "مقارنة شركات التداول",
    "أفضل شركة فوركس",
    "شركات فوركس مرخصة",
    "تراخيص شركات التداول",
    "مراجعات شركات التداول",
    "حساب إسلامي بدون فوائد",
    "forex broker comparison",
  ],
  brokers: [
    "شراكة شركات التداول",
    "وكيل ماستر",
    "master ib",
    "اتفاقية IB",
    "تعاقد شركات تداول",
    "تسويق شركات الفوركس",
    "ib partnership program",
  ],
  affiliates: [
    "وكيل IB فوركس",
    "عمولة وكيل تداول",
    "برنامج الشراكة فوركس",
    "ريبيت فوركس",
    "أرباح الوكلاء",
    "introducing broker commission",
  ],
  offers: [
    "عروض شركات التداول",
    "بونص تداول",
    "بونص بدون إيداع",
    "بونص ترحيبي فوركس",
    "forex bonus offers",
  ],
  spreads: [
    "مقارنة السبريد",
    "سبريد الذهب",
    "أقل سبريد فوركس",
    "تكلفة التداول",
    "forex spread comparison",
  ],
  tools: [
    "حاسبة لوت",
    "حاسبة الهامش",
    "حاسبة النقاط",
    "أدوات تداول مجانية",
    "المفكرة الاقتصادية",
    "forex calculators",
  ],
  forum: [
    "منتدى فوركس عربي",
    "تحليلات الفوركس",
    "أخبار التداول",
    "مجتمع المتداولين",
    "arabic forex forum",
  ],
  blog: [
    "تعليم الفوركس",
    "مقالات تداول",
    "استراتيجيات التداول",
    "شرح الفوركس للمبتدئين",
  ],
} as const;

export type KeywordSet = keyof typeof KEYWORDS;

/**
 * Is the English locale a real translation yet?
 *
 * It is not. Every page's copy is written in Arabic with no locale branch, so
 * /en/compare serves the Arabic page under `lang="en"`. Declaring that as the
 * English version does active harm rather than nothing: the hreflang cluster
 * promises English and delivers Arabic, which makes Google distrust the whole
 * cluster including the Arabic side, and every page ships as a near-exact
 * duplicate on a second URL.
 *
 * So until the copy is actually translated, /en stays crawlable but
 * unindexed, is not offered as an hreflang alternate, and is left out of the
 * sitemap. Flip this to true once translations land and all three follow.
 */
export const EN_TRANSLATED = false;

/** Canonical URL for a path in a given locale (Arabic is unprefixed). */
export function canonicalUrl(path: string, locale: string = "ar"): string {
  const base = getSiteUrl();
  const clean = path === "/" ? "" : path;
  return locale === "ar" ? `${base}${clean || "/"}` : `${base}/en${clean}`;
}

/**
 * Page metadata with canonical, hreflang alternates, OG and Twitter cards
 * filled consistently. Pages pass what makes them different; everything that
 * should be identical across the site is decided here once.
 */
export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
  keywords?: readonly string[];
  locale?: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  const { title, description, path, keywords, locale = "ar", image, type = "website" } = opts;
  const base = getSiteUrl();
  const clean = path === "/" ? "" : path;
  const url = canonicalUrl(path, locale);
  const ogImage = image ?? `${base}/api/banner?size=wide`;

  return {
    title,
    description,
    ...(keywords?.length ? { keywords: [...keywords] } : {}),
    // An untranslated /en is not an alternate — it is the same page again.
    ...(EN_TRANSLATED || locale === "ar"
      ? {}
      : { robots: { index: false, follow: true } }),
    alternates: {
      canonical: url,
      languages: EN_TRANSLATED
        ? {
            ar: `${base}${clean || "/"}`,
            en: `${base}/en${clean}`,
            "x-default": `${base}${clean || "/"}`,
          }
        : {
            ar: `${base}${clean || "/"}`,
            "x-default": `${base}${clean || "/"}`,
          },
    },
    openGraph: {
      type,
      url,
      siteName: SITE.name,
      locale: locale === "ar" ? "ar_AR" : "en_US",
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
