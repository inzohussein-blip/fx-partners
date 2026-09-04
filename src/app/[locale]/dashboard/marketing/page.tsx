import { createClient } from "@/lib/supabase/server";
import { ReferralGenerator } from "@/components/dashboard/referral-generator";
import { getSiteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getData() {
  const siteUrl = getSiteUrl();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { ibId: null, ibCode: null, links: [], siteUrl };
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ibId: null, ibCode: null, links: [], siteUrl };

    const { data: ib } = await supabase
      .from("ib_accounts")
      .select("id,ib_code")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!ib) return { ibId: null, ibCode: null, links: [], siteUrl };

    const { data: links } = await supabase
      .from("referral_links")
      .select("id,slug,campaign,target_url,clicks,signups")
      .eq("ib_id", ib.id)
      .order("created_at", { ascending: false });

    return {
      ibId: ib.id,
      ibCode: ib.ib_code,
      links: links ?? [],
      siteUrl,
    };
  } catch {
    return { ibId: null, ibCode: null, links: [], siteUrl };
  }
}

const BANNERS = [
  { size: "wide", label: "1200×630 (سوشيال)" },
  { size: "leaderboard", label: "728×90" },
  { size: "rectangle", label: "300×250" },
  { size: "skyscraper", label: "160×600" },
];

export default async function MarketingPage() {
  const { ibId, ibCode, links, siteUrl } = await getData();

  const ref =
    links.length > 0 ? `${siteUrl}/r/${links[0].slug}` : siteUrl;
  const bannerUrl = (size: string) =>
    `/api/banner?size=${size}&ref=${encodeURIComponent(ref)}&name=${encodeURIComponent(
      ibCode ?? ""
    )}`;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-white">أدوات التسويق</h1>
        <p className="mt-1 text-sm text-slate-400">
          ولّد روابط إحالة ديناميكية وتابع أداء كل حملة.
        </p>
      </header>

      <ReferralGenerator
        ibId={ibId}
        ibCode={ibCode}
        initialLinks={links}
        siteUrl={siteUrl}
      />

      <section className="card-surface p-6">
        <h2 className="text-lg font-semibold text-white">البانرات الدعائية</h2>
        <p className="mt-2 text-sm text-slate-400">
          بانرات جاهزة تحمل رابط إحالتك تلقائياً — عاينها وحمّلها لنشرها في قنواتك.
        </p>
        {links.length === 0 && (
          <p className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-400">
            أنشئ رابط إحالة أعلاه ليظهر داخل البانرات تلقائياً.
          </p>
        )}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {BANNERS.map((b) => (
            <div
              key={b.size}
              className="flex flex-col gap-3 rounded-xl border border-white/5 bg-ink-900/40 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{b.label}</span>
                <a
                  href={bannerUrl(b.size)}
                  download={`fx-partners-${b.size}.png`}
                  className="rounded-lg bg-brand-500/15 px-3 py-1.5 text-xs font-semibold text-brand-200 hover:bg-brand-500/25"
                >
                  تنزيل
                </a>
              </div>
              <div className="grid place-items-center overflow-hidden rounded-lg bg-black/20 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img loading="lazy" decoding="async"
                  src={bannerUrl(b.size)}
                  alt={`FX Partners banner ${b.label}`}
                  className="max-h-48 w-auto max-w-full rounded"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
