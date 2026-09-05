import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { CouponCard, type Coupon } from "@/components/marketing/coupon-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Crosshair, ArrowLeft, Flame, Ticket } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "القنّاص المالي — عروض التداول الحصرية | FX Partners",
  description:
    "أحدث عروض وبونصات شركات التداول، محدّثة لحظياً. اقتنص الفرصة قبل انتهائها.",
};

type Campaign = {
  id: string;
  broker_slug: string | null;
  title: string;
  message: string;
  cta_label: string | null;
  created_at: string;
};

async function getCampaigns(): Promise<Campaign[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("campaigns")
      .select("id,broker_slug,title,message,cta_label,created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(50);
    return (data as Campaign[]) ?? [];
  } catch {
    return [];
  }
}

async function getCoupons(): Promise<Coupon[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("coupons")
      .select("id,broker_name,title,code,referral_url,description")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(50);
    return (data as Coupon[]) ?? [];
  } catch {
    return [];
  }
}

export default async function OffersPage() {
  const [campaigns, coupons] = await Promise.all([getCampaigns(), getCoupons()]);

  return (
    <>
      <SiteHeader />

      <section className="hero-glow">
        <Container className="py-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            <Crosshair className="h-3.5 w-3.5" />
            القنّاص المالي
          </span>
          <h1 className="mt-5 text-4xl font-extrabold text-white sm:text-5xl">
            عروض حصرية.. اقتنصها قبل انتهائها
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            أحدث بونصات وعروض شركات التداول، محدّثة لحظياً من فريق FX Partners.
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading
            eyebrow="العروض النشطة"
            icon={Flame}
            title="بونصات وعروض محدّثة لحظياً"
            subtitle="اختر العرض الأنسب لك وافتح حسابك عبر رابطنا الحصري."
            align="start"
          />
          <div className="mt-10" />
          {campaigns.length === 0 ? (
            <div className="card-surface p-12 text-center text-sm text-slate-500">
              لا توجد عروض نشطة حالياً. تابعنا — الفرص تُطلق في أي لحظة.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((c) => (
                <div key={c.id} className="card-surface relative overflow-hidden p-6">
                  <div className="hero-glow absolute inset-0 opacity-50" />
                  <div className="relative">
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[11px] text-orange-300">
                      <Flame className="h-3 w-3" /> عرض نشط
                    </span>
                    <h3 className="mt-3 text-lg font-bold text-white">{c.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300" dir="auto">
                      {c.message}
                    </p>
                    {c.broker_slug && (
                      <Link
                        href={`/brokers/${c.broker_slug}`}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
                      >
                        {c.cta_label || "سجّل الآن"}
                        <ArrowLeft className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Exclusive coupon codes */}
      {coupons.length > 0 && (
        <section className="pb-24">
          <Container>
            <SectionHeading
              eyebrow="كوبونات"
              icon={Ticket}
              title="أكواد وكوبونات حصرية"
              subtitle="انسخ الكود وافتح حسابك عبر رابطنا الحصري للحصول على العرض."
              align="start"
            />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {coupons.map((c) => (
                <CouponCard key={c.id} coupon={c} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <SiteFooter />
    </>
  );
}
