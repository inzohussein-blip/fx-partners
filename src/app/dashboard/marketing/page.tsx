import { createClient } from "@/lib/supabase/server";
import { ReferralGenerator } from "@/components/dashboard/referral-generator";

export const dynamic = "force-dynamic";

async function getData() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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

export default async function MarketingPage() {
  const { ibId, ibCode, links, siteUrl } = await getData();

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
          حمّل مجموعة البانرات الجاهزة بمقاسات متعددة لاستخدامها في حملاتك.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {["728×90", "300×250", "160×600"].map((size) => (
            <div
              key={size}
              className="grid aspect-video place-items-center rounded-xl border border-dashed border-white/10 bg-ink-900/40 text-sm text-slate-500"
            >
              بانر {size}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
