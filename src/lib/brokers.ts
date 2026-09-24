export type BrokerStatus = "partnered" | "not_partnered";

export type BrokerLink = {
  id: string;
  label: string | null;
  referral_url: string;
  agent_commission: string | null;
  client_benefits: string | null;
  code?: string | null;
};

/** Branded, tracked redirect URL for a broker link (falls back to the raw URL). */
export function linkHref(l: Pick<BrokerLink, "code" | "referral_url">): string {
  return l.code ? `/go/${l.code}` : l.referral_url;
}

export type Broker = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  status: BrokerStatus;
  deposit_bonus: string | null;
  welcome_bonus: string | null;
  description: string | null;
  rating: number;
  reviews_count: number;
  badges?: string[];
  spread_from?: number | null;
  leverage_max?: string | null;
  bonus_no_deposit?: boolean;
  bonus_withdrawable?: boolean;
  supports_gold?: boolean;
  licenses?: string[];
  // Operational specs (quick comparison grid)
  supports_ea?: boolean;
  allows_hedging?: boolean;
  swap_free?: boolean;
  allows_scalping?: boolean;
  min_deposit?: number | null;
  deposit_methods?: string[];
  /** Platforms offered: mt4, mt5, ctrader, tradingview, proprietary. */
  platforms?: string[];
  /**
   * ISO 3166-1 alpha-2 codes we have verified the broker onboards.
   * Empty means unverified, never "accepts everyone".
   */
  accepted_countries?: string[];
  broker_links?: BrokerLink[];
  /**
   * Third-party directory data. Kept separate from our verified fields and
   * always shown as external and unverified — never treated as our own
   * rating, a verified licence, or a verified spec.
   */
  external_score?: number | null;
  external_source?: string | null;
  external_data?: ExternalData | null;
};

export type ExternalData = {
  regulation?: string | null;
  regulation_details?: string | null;
  leverage?: string | null;
  min_deposit?: string | null;
  founded_year?: string | null;
  headquarters?: string | null;
  website_url?: string | null;
  regulation_country?: string | null;
  business_model?: string | null;
  years?: string | null;
  account_type?: string | null;
  platforms?: string | null;
};

/** The external 0–10 score mapped onto our 0–5 star scale, when present. */
export function externalStars(b: Broker): number | null {
  return b.external_score != null ? Math.round((b.external_score / 2) * 10) / 10 : null;
}

/**
 * The external facts worth showing on a profile, as label/value pairs, in a
 * fixed order. Only filled fields are returned. Shown under an explicit
 * "external, unverified" heading — never merged into our verified specs.
 */
export function externalFacts(b: Broker): { label: string; value: string }[] {
  const d = b.external_data;
  if (!d) return [];
  const facts: { label: string; value: string }[] = [];
  const add = (label: string, v?: string | null) => {
    const s = v?.trim();
    if (s) facts.push({ label, value: s });
  };
  add("الجهات الرقابية", d.regulation);
  add("تفاصيل التراخيص", d.regulation_details);
  add("الرافعة المالية", d.leverage);
  add("الحد الأدنى للإيداع", d.min_deposit);
  add("سنة التأسيس", d.founded_year);
  add("المقرّ", d.headquarters);
  add("بلد التنظيم", d.regulation_country);
  add("سنوات العمل", d.years);
  add("نموذج التنفيذ", d.business_model);
  add("نوع الحساب", d.account_type);
  add("المنصّات", d.platforms);
  return facts;
}

/**
 * A broker counts as rated only once real reviews exist. Until then the stored
 * rating is 0, and printing "0.0 ★" reads as a *bad* score rather than "not
 * rated yet" — the opposite of the truth, on a page traders act on. Every
 * rating surface checks this and renders an unrated state instead.
 */
export function isRated(b: { rating: number; reviews_count: number }): boolean {
  return b.reviews_count > 0 && b.rating > 0;
}

/** Common financial regulators shown as trust badges. */
export const REGULATORS: Record<string, { label: string; flag: string }> = {
  fca: { label: "FCA", flag: "🇬🇧" },
  cysec: { label: "CySEC", flag: "🇨🇾" },
  asic: { label: "ASIC", flag: "🇦🇺" },
  fsca: { label: "FSCA", flag: "🇿🇦" },
  dfsa: { label: "DFSA", flag: "🇦🇪" },
  fsa: { label: "FSA", flag: "🌐" },
  cbcs: { label: "CBCS", flag: "🌐" },
  fscm: { label: "FSC", flag: "🇲🇺" },
};

export const REGULATOR_KEYS = Object.keys(REGULATORS);

export function regulatorMeta(key: string) {
  return REGULATORS[key];
}

/** Marketing badges admins can toggle per broker. */
export const BADGES: Record<
  string,
  { label: string; emoji: string; className: string }
> = {
  hot: {
    label: "الأعلى طلباً",
    emoji: "🔥",
    className: "bg-orange-500/15 text-orange-300 ring-orange-400/30",
  },
  best_welcome: {
    label: "أفضل بونص ترحيبي",
    emoji: "🎁",
    className: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  },
  platinum: {
    label: "شريك بلاتيني",
    emoji: "💎",
    className: "bg-cyan-500/15 text-cyan-200 ring-cyan-400/30",
  },
  top_rated: {
    label: "الأعلى تقييماً",
    emoji: "⭐",
    className: "bg-yellow-500/15 text-yellow-300 ring-yellow-400/30",
  },
  low_spread: {
    label: "أقل سبريد",
    emoji: "⚡",
    className: "bg-brand-500/15 text-brand-200 ring-brand-400/30",
  },
};

export const BADGE_KEYS = Object.keys(BADGES);

export function badgeMeta(key: string) {
  return BADGES[key];
}

export type BrokerReview = {
  id: string;
  user_name: string | null;
  comment: string;
  stars: number;
  is_admin_reply: boolean;
  created_at: string;
};

export function statusLabel(status: BrokerStatus): string {
  return status === "partnered" ? "شريك معتمد" : "غير متعاقد";
}
