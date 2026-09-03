import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getContent } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import { LogoCloud } from "@/components/marketing/logo-cloud";
import { Testimonials } from "@/components/marketing/testimonials";
import { Faq } from "@/components/marketing/faq";
import {
  ArrowLeft,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Link2,
  Users,
  BarChart3,
} from "lucide-react";

async function getPartners() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("partners")
      .select("id,name,logo_url")
      .eq("is_active", true)
      .order("sort_order");
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const hero = await getContent("home.hero", {
    titleTop: "أقوى معاً،",
    titleAccent: "نجاح أعظم",
    subtitle:
      "نشارك الوكلاء وشركات التداول العالمية لفتح فرص جديدة ودفع النمو، بأعلى نسب العمولات وشفافية كاملة في الأرباح.",
    cta: "ابدأ الشراكة الآن",
  });

  const stats = await getContent("home.stats", {
    partners: "2,400+",
    volume: "$18B+",
    countries: "60+",
    payout: "$4.6M+",
  });

  const partners = await getPartners();

  const features = [
    {
      icon: TrendingUp,
      title: "نسب عمولة تنافسية",
      desc: "Revenue Share حتى 60% أو CPA ثابت لكل عميل مؤهّل — أنت تختار الأنسب.",
    },
    {
      icon: Link2,
      title: "روابط إحالة ديناميكية",
      desc: "أنشئ روابط تتبّع لا محدودة لحملاتك وتابع النقرات والتسجيلات لحظياً.",
    },
    {
      icon: BarChart3,
      title: "لوحة تحكم حيّة",
      desc: "إحصائيات الأرباح وحجم التداول وعدد الإحالات في مكان واحد.",
    },
    {
      icon: Wallet,
      title: "سحوبات سريعة",
      desc: "تتبّع رصيدك واطلب السحب بعدة طرق دفع مع معالجة سريعة وشفافة.",
    },
    {
      icon: ShieldCheck,
      title: "أمان على مستوى البيانات",
      desc: "حماية صارمة (RLS) على كل جدول — بياناتك المالية معزولة ومشفّرة.",
    },
    {
      icon: Users,
      title: "نظام وكلاء متعدد المستويات",
      desc: "ابنِ شبكة Sub-IB واكسب من أداء الوكلاء التابعين لك.",
    },
  ];

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="hero-glow relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-faint [background-size:44px_44px] opacity-40" />
        <Container className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              التعاون والنمو — B2B & IB
            </span>
            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight text-white sm:text-6xl">
              {hero.titleTop} <span className="text-gradient">{hero.titleAccent}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-300">
              {hero.subtitle}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button href="/login" className="text-base">
                {hero.cta}
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button href="/affiliates" variant="secondary" className="text-base">
                تعرّف على العمولات
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "شريك نشط", value: stats.partners },
              { label: "حجم تداول", value: stats.volume },
              { label: "دولة", value: stats.countries },
              { label: "أرباح مدفوعة", value: stats.payout },
            ].map((s) => (
              <div key={s.label} className="card-surface p-5 text-center">
                <div dir="ltr" className="text-2xl font-bold text-brand-300 sm:text-3xl">
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Trusted-by logo cloud */}
      <LogoCloud partners={partners} />

      {/* Features */}
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              كل ما تحتاجه لتنمية أرباحك
            </h2>
            <p className="mt-4 text-slate-400">
              أدوات احترافية مصمّمة للوكلاء والمسوّقين وشركات التداول.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="card-surface group p-6 transition hover:border-brand-500/30"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/10 text-brand-300 transition group-hover:bg-brand-500/20">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ */}
      <Faq />

      {/* CTA */}
      <section className="py-12">
        <Container>
          <div className="card-surface relative overflow-hidden p-10 text-center sm:p-16">
            <div className="hero-glow absolute inset-0 opacity-70" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                جاهز للبدء؟
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-300">
                أنشئ حساب شريك مجاناً خلال دقائق وابدأ في توليد روابط الإحالة.
              </p>
              <div className="mt-8 flex justify-center">
                <Button href="/login" className="text-base">
                  إنشاء حساب شريك
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </>
  );
}
