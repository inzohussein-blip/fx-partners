export type AnnouncementCategory = "feature" | "promo" | "commission" | "news";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  category: string;
  published_at: string;
};

export const CATEGORY_META: Record<
  AnnouncementCategory,
  { label: string; emoji: string; className: string }
> = {
  feature: {
    label: "ميزة جديدة",
    emoji: "✨",
    className: "bg-brand-500/15 text-brand-200",
  },
  promo: {
    label: "عرض",
    emoji: "🎁",
    className: "bg-amber-500/15 text-amber-300",
  },
  commission: {
    label: "عمولات",
    emoji: "💰",
    className: "bg-emerald-500/15 text-emerald-300",
  },
  news: {
    label: "خبر",
    emoji: "📢",
    className: "bg-white/10 text-slate-300",
  },
};

export function categoryMeta(category: string) {
  return CATEGORY_META[(category as AnnouncementCategory)] ?? CATEGORY_META.news;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `قبل ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `قبل ${hrs} ساعة`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `قبل ${days} يوم`;
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium" }).format(
    new Date(iso)
  );
}
