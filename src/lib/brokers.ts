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
  broker_links?: BrokerLink[];
};

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
