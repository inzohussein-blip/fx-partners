import type { Metadata } from "next";
import { pageMeta, KEYWORDS } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Booking, type Slot } from "@/components/marketing/booking";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  Building2,
  Cpu,
  Droplets,
  Handshake,
  Network,
  Users,
  Star,
  ShieldCheck,
  Megaphone,
  BarChart3,
  CheckCircle2,
  ArrowLeft,
  Scale,
  ClipboardCheck,
  FileSignature,
  Rocket,
  MessagesSquare,
} from "lucide-react";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return pageMeta({
    title: "شراكة شركات التداول — اتفاقية وكيل ماستر (Master IB)",
    description:
      "شركات التداول: وزّعوا عروضكم على جمهور عربي مؤهّل وشبكة وكلاء IB عبر اتفاقية ماستر واحدة مع FX Partners — تغطية تسويقية كاملة، إدارة وكلاء، ومتابعة أداء شفّافة.",
    path: "/brokers",
    keywords: KEYWORDS.brokers,
    locale,
  });
}

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
  const [partners, slots, t] = await Promise.all([
    getPartners(),
    getSlots(),
    getTranslations(),
  ]);

  // Reach figures come from the site's editable Stats copy, not invented here.
  const reach = [
    { value: t("Stats.agents"), label: t("Stats.agentsLabel"), icon: Users },
    { value: t("Stats.brokersCount"), label: t("Stats.brokersLabel"), icon: Building2 },
    { value: t("Stats.countries"), label: t("Stats.countriesLabel"), icon: Network },
  ];

  const why = [
    {
      icon: Users,
      title: "شبكة وكلاء جاهزة",
      desc: "بدل التعاقد مع عشرات الوكلاء فرادى، تصل إلى شبكة Sub-IB كاملة عبر حساب ماستر واحد.",
    },
    {
      icon: Star,
      title: "حضور على منصّة مقارنة",
      desc: "صفحة شركة كاملة بتقييمات موثّقة من متداولين حقيقيين — لا إعلان عابر.",
    },
    {
      icon: FileSignature,
      title: "اتفاقية واحدة",
      desc: "عقد ماستر واحد يغطّي الشبكة كلها، بتسوية وتقارير مركزية.",
    },
    {
      icon: Megaphone,
      title: "قنوات تسويق عربية",
      desc: "المنتدى، القنّاص المالي (العروض)، المدوّنة، وجداول السبريد — جمهور يبحث فعلاً عن شركة.",
    },
    {
      icon: BarChart3,
      title: "تقارير شفّافة",
      desc: "متابعة الإحالات والحجم والعمولات عبر لوحة موحّدة للطرفين.",
    },
    {
      icon: ShieldCheck,
      title: "جمهور مؤهّل",
      desc: "متداولون يقارنون قبل التسجيل — نيّة تسجيل أعلى من الزيارات الباردة.",
    },
  ];

  const deliverables = [
    "صفحة شركة كاملة (تقييمات، تراخيص، أنواع الحسابات)",
    "إدراج في جدول المقارنة ومقارنات الوجه لوجه",
    "إدراج في جدول السبريدات المباشر",
    "روابط إحالة وكوبونات لكل وكيل في الشبكة",
    "حملات وعروض موسمية عبر «القنّاص المالي»",
    "قسم نقاش مخصّص داخل المنتدى",
  ];

  const steps = [
    { icon: MessagesSquare, title: "تواصل معنا", desc: "احجز مكالمة تعريفية قصيرة أو راسلنا بتفاصيل شركتك." },
    { icon: ClipboardCheck, title: "مطابقة المعايير", desc: "نراجع الترخيص وشروط التداول وسياسة السحب." },
    { icon: FileSignature, title: "اتفاقية ماستر IB", desc: "نتّفق على الشروط والعمولات ونوقّع عقداً واحداً." },
    { icon: Rocket, title: "الإطلاق والتوزيع", desc: "نُطلق صفحتك ونوزّع روابطك على شبكة الوكلاء." },
  ];

  const criteria = [
    "ترخيص ساري من جهة رقابية معتبرة",
    "شروط تداول تنافسية وشفافة",
    "سجلّ سحوبات موثوق وسريع",
    "دعم عملاء يخدم المتداول العربي",
  ];

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="hero-glow">
        <Container className="py-10 text-center sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            <Handshake className="h-3.5 w-3.5" aria-hidden />
            شراكات B2B
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.35] text-white sm:text-5xl">
            شركات التداول:{" "}
            <span className="text-gradient">وزّعوا عروضكم عبر شبكتنا</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            <span className="font-semibold text-white">FX Partners</span> وكيل ماستر
            (Master IB) ومنصّة مقارنة عربية. نوصل شركتك إلى متداولين يقارنون قبل
            التسجيل وإلى شبكة وكلاء Sub-IB — عبر اتفاقية واحدة بدل عشرات العقود.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button href="#booking">احجز مكالمة شراكة</Button>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-brand-400/50 hover:bg-white/5"
            >
              راسلنا
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          {/* Reach */}
          {/* Three numbers. Stacked one-per-row with desktop padding they cost
              a phone ~900px of scrolling; side by side they are one glance. */}
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-2.5 sm:mt-14 sm:gap-4">
            {reach.map((r) => (
              <div key={r.label} className="card-surface p-3 text-center sm:p-6">
                <span className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20 sm:h-11 sm:w-11">
                  <r.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <div
                  className="mt-2.5 text-lg font-extrabold text-gradient sm:mt-4 sm:text-2xl"
                  dir="ltr"
                >
                  {r.value}
                </div>
                <div className="mt-1 text-[10px] leading-tight text-slate-400 sm:text-xs">
                  {r.label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Why partner with us */}
      <section className="ambient-section py-16 sm:py-20">
        <span
          className="ambient -start-24 top-1/4 h-80 w-80"
          style={{ background: "radial-gradient(circle, rgba(0,144,252,0.22) 0%, transparent 70%)" }}
          aria-hidden
        />
        <Container>
          <SectionHeading
            eyebrow="لماذا نحن"
            icon={Handshake}
            title="لماذا الشراكة مع وكيل ماستر؟"
            subtitle="نحن لسنا شركة تداول — لا ننافسك. دورنا أن نوصلك بالمتداول والوكيل المناسبين."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {why.map((b) => (
              <div
                key={b.title}
                className="card-surface group p-6 transition hover:-translate-y-0.5 hover:ring-1 hover:ring-brand-500/30"
              >
                <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20 transition group-hover:bg-brand-500/20">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{b.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* What you get + criteria */}
      <section className="py-16">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
            <div className="card-surface p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-200">
                <Network className="h-3.5 w-3.5" aria-hidden />
                ما الذي تحصل عليه
              </div>
              <h3 className="mt-4 text-2xl font-bold text-white">حزمة الحضور الكاملة</h3>
              <ul className="mt-6 space-y-3">
                {deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-surface p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <Scale className="h-3.5 w-3.5" aria-hidden />
                معايير القبول
              </div>
              <h3 className="mt-4 text-2xl font-bold text-white">لا نُدرج كل شركة</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                مصداقيتنا أمام المتداولين هي رأس مالنا. لذلك نراجع كل شركة قبل
                إدراجها، ونرفض ما لا يستوفي المعايير.
              </p>
              <ul className="mt-6 space-y-3">
                {criteria.map((c) => (
                  <li key={c} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* How to start */}
      <section className="py-16">
        <Container>
          <SectionHeading
            eyebrow="كيف نبدأ"
            icon={Rocket}
            title="من أول مكالمة إلى الإطلاق"
            subtitle="مسار واضح وقصير — بلا وسطاء ولا تعقيد."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="card-surface relative p-6">
                <span className="absolute -top-3 end-6 rounded-full bg-brand-gradient px-2.5 py-0.5 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Existing partners */}
      <section className="pb-20">
        <Container>
          <SectionHeading
            eyebrow="شبكتنا"
            icon={Network}
            title="شركاؤنا"
            subtitle="شركات تداول ومزوّدو سيولة وتقنية نثق بهم ونعمل معهم."
          />
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
