import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { createClient } from "@/lib/supabase/server";
import { BrokerDirectory } from "@/components/brokers/broker-directory";
import { HeadToHeadPicker } from "@/components/brokers/head-to-head-picker";
import type { Broker } from "@/lib/brokers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مقارنة شركات التداول | FX Partners",
  description:
    "دليل ومقارنة شركات التداول (Forex Brokers): التقييمات، البونصات، وعمولات الوكلاء — قارن واختر شركتك بثقة.",
};

async function getBrokers(): Promise<Broker[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("brokers")
      .select(
        "id,slug,name,logo_url,status,deposit_bonus,welcome_bonus,description,rating,reviews_count,badges,broker_links(id,label,referral_url,agent_commission,client_benefits)"
      )
      .eq("is_published", true)
      .order("sort_order")
      .order("rating", { ascending: false });
    return (data as unknown as Broker[]) ?? [];
  } catch {
    return [];
  }
}

export default async function ComparePage() {
  const brokers = await getBrokers();

  return (
    <>
      <SiteHeader />

      <section className="hero-glow">
        <Container className="py-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            دليل الشركات
          </span>
          <h1 className="mt-5 text-4xl font-extrabold text-white sm:text-5xl">
            قارن شركات التداول واختر الأفضل
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            تقييمات حقيقية، بونصات محدّثة، وعمولات وكلاء شفّافة — كل ما تحتاجه
            لاختيار شركتك في مكان واحد.
          </p>
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          {brokers.length === 0 ? (
            <div className="card-surface p-12 text-center text-sm text-slate-500">
              لا توجد شركات مضافة بعد. أضِفها من لوحة الإدارة →{" "}
              <span className="text-brand-300">الشركات</span>.
            </div>
          ) : (
            <div className="space-y-6">
              {brokers.length >= 2 && (
                <HeadToHeadPicker
                  options={brokers.map((b) => ({ slug: b.slug, name: b.name }))}
                />
              )}
              <BrokerDirectory brokers={brokers} />
            </div>
          )}
        </Container>
      </section>

      <SiteFooter />
    </>
  );
}
