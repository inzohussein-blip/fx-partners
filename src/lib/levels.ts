export type Tier = {
  key: string;
  label: string;
  min: number;
  rate: number; // revenue share %
};

export const TIERS: Tier[] = [
  { key: "standard", label: "وكيل مبتدئ", min: 0, rate: 40 },
  { key: "silver", label: "وكيل فضي", min: 25, rate: 50 },
  { key: "gold", label: "وكيل ذهبي", min: 100, rate: 55 },
  { key: "vip", label: "وكيل VIP", min: 300, rate: 60 },
];

export function levelFor(referrals: number) {
  let idx = 0;
  for (let i = 0; i < TIERS.length; i++) {
    if (referrals >= TIERS[i].min) idx = i;
  }
  const current = TIERS[idx];
  const next = TIERS[idx + 1] ?? null;
  const spanStart = current.min;
  const spanEnd = next ? next.min : current.min;
  const progress = next
    ? Math.min(100, ((referrals - spanStart) / (spanEnd - spanStart)) * 100)
    : 100;
  const toNext = next ? Math.max(0, next.min - referrals) : 0;
  return { current, next, progress, toNext, index: idx };
}
