import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Booking, type Slot } from "@/components/marketing/booking";
import { Building2, Cpu, Droplets, Handshake } from "lucide-react";

export const metadata: Metadata = {
  title: "تعاون الشركات (Brokers / B2B)",
  description:
    "عروض التعاون بين FX Partners وشركات التداول العالمية ومزوّدي السيولة وشركات التقنية المالية.",
};

const categoryIcon: Record<string, typeof Building2> = {
  broker: Building2,
  liquidity: Droplets,
  technology: Cpu,
};

type Partner = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  website: string | null;
};

async function getPartners(): Promise<Partner[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("partners")
      .select("id,name,description,category,website")
      .eq("is_active", true)
      .order("sort_order");
    return data ?? [];
  } catch {
    return [];
  }
}

async function getSlots(): Promise<Slot[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("meeting_slots")
      .select("id,starts_at,duration_min")
      .eq("status", "open")
      .gt("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(60);
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function BrokersPage() {
  const [partners, slots] = await Promise.all([getPartners(), getSlots()]);

  const benefits = [
    { icon: Handshake, title: "شراكة مرنة", desc: "نماذج تعاون White-label و Revenue Share تناسب حجم أعمالك." },
    { icon: Droplets, title: "سيولة عميقة", desc: "وصول إلى مزوّدي سيولة من الطبقة الأولى وفروقات تنافسية." },
    { icon: Cpu, title: "تكامل تقني", desc: "واجهات API وحلول MT4/MT5 وتقارير آلية." },
  ];

  return (
    <>
      <SiteHeader />

      <section className="hero-glow">
        <Container className="py-20 text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            حلول التعاون للشركات (B2B)
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            نربط شركات التداول ومزوّدي السيولة وشركات التقنية المالية بشبكة واسعة
            من الوكلاء والمسوّقين حول العالم.
          </p>
          <div className="mt-8 flex justify-center">
            <Button href="#booking">احجز مكالمة شراكة</Button>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="card-surface p-6">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{b.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{b.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-20">
        <Container>
          <h2 className="text-center text-3xl font-bold text-white">شركاؤنا</h2>
          {partners.length === 0 ? (
            <p className="mt-8 text-center text-sm text-slate-500">
              لا توجد شركات مضافة بعد. أضِفها من جدول <code>partners</code> في Supabase.
            </p>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((p) => {
                const Icon = categoryIcon[p.category ?? "broker"] ?? Building2;
                return (
                  <div key={p.id} className="card-surface p-6">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 text-brand-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-white">{p.name}</h3>
                    </div>
                    {p.description && (
                      <p className="mt-3 text-sm text-slate-400">{p.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Container>
      </section>

      <Booking slots={slots} />

      <SiteFooter />
    </>
  );
}
