import { z } from "zod";

/**
 * Page sections: which sections each public page shows, in what order, plus
 * the custom blocks an admin adds (cards, call to action, banner, text).
 *
 * Built-in sections are the ones written in code; their ids are listed per
 * page below and each page passes the matching JSX to <PageSections>. A page
 * with no saved rows renders its built-ins in the order listed here, so
 * nothing changes until someone customises it (migration 0036).
 */

export type Builtin = { id: string; label: string; required?: boolean };
export type PageDef = { key: string; path: string; label: string; builtins: Builtin[] };

/** The page's own body, for pages that are one block of content. */
const CONTENT: Builtin = { id: "content", label: "محتوى الصفحة", required: true };

export const PAGES: PageDef[] = [
  {
    key: "home",
    path: "/",
    label: "الصفحة الرئيسية",
    builtins: [
      { id: "hero", label: "الواجهة الرئيسية (Hero)", required: true },
      { id: "network", label: "شبكة الشركات" },
      { id: "top-rated", label: "الشركات الأعلى تقييماً" },
      { id: "best-for", label: "الأفضل لـ…" },
      { id: "compare-teaser", label: "مقارنة شركتين" },
      { id: "latest-reviews", label: "أحدث المراجعات" },
      { id: "how-it-works", label: "كيف يعمل" },
      { id: "tools", label: "الأدوات والحاسبات" },
      { id: "markets", label: "الأسواق والمؤشرات" },
      { id: "testimonials", label: "آراء الشركاء" },
      { id: "faq", label: "الأسئلة الشائعة" },
      { id: "cta", label: "الدعوة الختامية" },
    ],
  },
  {
    key: "affiliates",
    path: "/affiliates",
    label: "برنامج الوكلاء",
    builtins: [
      { id: "hero", label: "الواجهة", required: true },
      { id: "identity", label: "من نحن كوكيل ماستر" },
      { id: "how", label: "كيف يعمل" },
      { id: "rates", label: "العمولات" },
      { id: "why", label: "لماذا نحن" },
      { id: "faq", label: "الأسئلة الشائعة" },
      { id: "cta", label: "الدعوة الختامية" },
    ],
  },
  {
    key: "brokers",
    path: "/brokers",
    label: "للشركات (B2B)",
    builtins: [
      { id: "hero", label: "الواجهة", required: true },
      { id: "why", label: "لماذا الشراكة معنا" },
      { id: "offer", label: "ما تحصلون عليه والشروط" },
      { id: "start", label: "كيف تبدأ" },
      { id: "partners", label: "الشركاء الحاليون" },
      { id: "booking", label: "حجز اجتماع" },
    ],
  },
  { key: "about", path: "/about", label: "من نحن", builtins: [{ id: "hero", label: "الواجهة", required: true }, CONTENT] },
  { key: "compare", path: "/compare", label: "مقارنة الشركات", builtins: [CONTENT] },
  { key: "markets", path: "/markets", label: "الأسواق الحية", builtins: [CONTENT] },
  { key: "indicators", path: "/indicators", label: "المؤشرات الاقتصادية", builtins: [CONTENT] },
  { key: "spreads", path: "/spreads", label: "السبريد", builtins: [CONTENT] },
  { key: "calendar", path: "/calendar", label: "التقويم", builtins: [CONTENT] },
  { key: "tools", path: "/tools", label: "الأدوات", builtins: [CONTENT] },
  { key: "free-tools", path: "/free-tools", label: "الأدوات المجانية", builtins: [CONTENT] },
  { key: "offers", path: "/offers", label: "العروض", builtins: [CONTENT] },
  { key: "best", path: "/best", label: "الأفضل لـ", builtins: [CONTENT] },
  { key: "blog", path: "/blog", label: "المدونة", builtins: [CONTENT] },
  { key: "forum", path: "/forum", label: "المنتدى", builtins: [CONTENT] },
  { key: "methodology", path: "/methodology", label: "منهجية التقييم", builtins: [CONTENT] },
  { key: "contact", path: "/contact", label: "اتصل بنا", builtins: [CONTENT] },
];

export function pageDef(key: string): PageDef | undefined {
  return PAGES.find((p) => p.key === key);
}

// ---------------------------------------------------------------------------
// Custom section content
// ---------------------------------------------------------------------------

/** Icons an admin can put on a card: a fixed list, mapped in the renderer. */
export const SECTION_ICONS = [
  "shield", "trophy", "chart", "users", "handshake", "gift", "zap", "star",
  "globe", "wallet", "book", "calendar", "bell", "scale", "target", "sparkles",
] as const;
export type SectionIcon = (typeof SECTION_ICONS)[number];

export const SECTION_TONES = ["brand", "accent", "amber", "emerald"] as const;

const MAX = { title: 140, body: 1200, label: 40 };

const text = (max: number) => z.string().trim().max(max).default("");
const i18n = (max: number) => z.object({ ar: text(max), en: text(max) }).default({ ar: "", en: "" });

/**
 * A link target: a path on this site ("/compare") or an https URL. Anything
 * else — "javascript:", "//evil.com", "/\\evil.com" — is dropped to "".
 */
export function cleanHref(value: unknown): string {
  if (typeof value !== "string") return "";
  const v = value.trim();
  if (/^\/(?![/\\])[^\s\u0000-\u001f]*$/.test(v)) return v;
  if (/^https:\/\/[^\s/\u0000-\u001f]+(\/[^\s\u0000-\u001f]*)?$/i.test(v)) return v;
  return "";
}
const href = z.unknown().transform(cleanHref);
const link = z.object({ label: i18n(MAX.label), href }).default({ label: { ar: "", en: "" }, href: "" });

export const cardsConfig = z.object({
  title: i18n(MAX.title),
  subtitle: i18n(MAX.body),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).catch(3).default(3),
  items: z
    .array(
      z.object({
        icon: z.enum(SECTION_ICONS).catch("sparkles").default("sparkles"),
        title: i18n(MAX.title),
        body: i18n(MAX.body),
        href,
        tone: z.enum(SECTION_TONES).catch("brand").default("brand"),
      })
    )
    .max(12)
    .default([]),
});

export const ctaConfig = z.object({
  title: i18n(MAX.title),
  body: i18n(MAX.body),
  primary: link,
  secondary: link,
});

export const bannerConfig = z.object({
  text: i18n(MAX.body),
  link,
  tone: z.enum(SECTION_TONES).catch("brand").default("brand"),
  /** ISO date (YYYY-MM-DD); the banner stops showing after this day. */
  expires: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")).catch("").default(""),
});

export const textConfig = z.object({
  title: i18n(MAX.title),
  body: i18n(4000),
});

export const CUSTOM_KINDS = {
  cards: { label: "بطاقات", schema: cardsConfig },
  cta: { label: "دعوة لإجراء (أزرار)", schema: ctaConfig },
  banner: { label: "بانر / تنبيه", schema: bannerConfig },
  text: { label: "نص حر", schema: textConfig },
} as const;
export type CustomKind = keyof typeof CUSTOM_KINDS;

export type CardsConfig = z.infer<typeof cardsConfig>;
export type CtaConfig = z.infer<typeof ctaConfig>;
export type BannerConfig = z.infer<typeof bannerConfig>;
export type TextConfig = z.infer<typeof textConfig>;

export type SectionRow =
  | { kind: "builtin"; builtin: string; is_visible: boolean }
  | { kind: CustomKind; is_visible: boolean; config: unknown };

/** One saved section, validated. Unknown kinds and malformed rows are dropped. */
export function parseRow(raw: unknown): SectionRow | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const visible = r.is_visible !== false;
  if (r.kind === "builtin") {
    return typeof r.builtin === "string" && r.builtin ? { kind: "builtin", builtin: r.builtin, is_visible: visible } : null;
  }
  if (typeof r.kind === "string" && r.kind in CUSTOM_KINDS) {
    const kind = r.kind as CustomKind;
    const parsed = CUSTOM_KINDS[kind].schema.safeParse(r.config ?? {});
    return parsed.success ? { kind, is_visible: visible, config: parsed.data } : null;
  }
  return null;
}

export type ResolvedSection =
  | { kind: "builtin"; id: string }
  | { kind: CustomKind; config: unknown; index: number };

/**
 * The sections to render, in order. With no saved rows: the page's built-ins
 * as the code lists them. With saved rows: those rows, visible ones only;
 * built-ins the code knows but the saved list does not mention (added after
 * the page was customised) follow at the end; required built-ins can never be
 * hidden; unknown built-in ids are skipped.
 */
export function resolveSections(page: PageDef, rows: SectionRow[]): ResolvedSection[] {
  const known = new Map(page.builtins.map((b) => [b.id, b]));
  if (rows.length === 0) return page.builtins.map((b) => ({ kind: "builtin", id: b.id }));

  const out: ResolvedSection[] = [];
  const mentioned = new Set<string>();
  rows.forEach((row, index) => {
    if (row.kind === "builtin") {
      const def = known.get(row.builtin);
      if (!def || mentioned.has(row.builtin)) return;
      mentioned.add(row.builtin);
      if (row.is_visible || def.required) out.push({ kind: "builtin", id: row.builtin });
    } else if (row.is_visible) {
      out.push({ kind: row.kind, config: row.config, index });
    }
  });
  for (const b of page.builtins) if (!mentioned.has(b.id)) out.push({ kind: "builtin", id: b.id });
  return out;
}

/** A banner past its expiry date (in UTC) is not shown. */
export function bannerExpired(config: BannerConfig, now = new Date()): boolean {
  return !!config.expires && config.expires < now.toISOString().slice(0, 10);
}

export function pickText(t: { ar: string; en: string }, locale: string): string {
  return locale === "ar" ? t.ar : t.en;
}
