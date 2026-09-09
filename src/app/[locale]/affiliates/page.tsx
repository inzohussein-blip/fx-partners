import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getContent } from "@/lib/content";
import {
  Check,
  UserPlus,
  Link2,
  Wallet,
  TrendingUp,
  Zap,
  Headphones,
  Layers,
  ArrowLeft,
  Rocket,
  Award,
  Sparkles,
  Handshake,
  Network,
  Building2,
  Scale,
  Users,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "برنامج الوكلاء (IB / Affiliate)",
  description:
    "نظام الإحالة، نسب الأرباح، والفوائد لوكلاء FX Partners. Revenue Share و CPA ونظام Sub-IB متعدد المستويات.",
};

export default async function AffiliatesPage() {
  const rates = await getContent("affiliates.rates", {
    revenue_share: "حتى 60%",
    cpa: "حتى $1,200",
    sub_ib: "نظام متعدد المستويات",
  });

  const tiers = [
    {
      name: "Standard",
      share: "40%",
      cpa: "$400",
      features: ["روابط إحالة غير محدودة", "لوحة إحصائيات حيّة", "دعم عبر البريد"],
      highlight: false,
    },
    {
      name: "Gold",
      share: "55%",
      cpa: "$800",
      features: [
        "كل مزايا Standard",
        "بانرات تسويقية جاهزة",
        "مدير حساب مخصّص",
        "سحوبات أسرع",
      ],
      highlight: true,
    },
    {
      name: "VIP",
      share: "60%",
      cpa: "$1,200",
      features: [
        "كل مزايا Gold",
        "نظام Sub-IB متعدد المستويات",
        "شروط تفاوضية خاصة",
        "أولوية في الدعم",
      ],
      highlight: false,
    },
  ];

  return (
    <>
      <SiteHeader />

      <section className="hero-glow">
        <Container className="py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            <Handshake className="h-3.5 w-3.5" aria-hidden />
            برنامج الشراكة
          </span>
          <h1 className="mt-5 text-4xl font-extrabold text-white sm:text-5xl">
            برنامج الوكلاء (IB / Affiliate)
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            انضمّ كوكيل فرعي (Sub-IB) تحت حسابات FX Partners الماستر لدى شبكة من
            الشركات المرخّصة — واربح من كل عميل تحيله، أياً كانت الشركة التي
            يختارها، عبر نسبة من الأرباح (Revenue Share) أو مبلغ ثابت (CPA).
          </p>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: "Revenue Share", value: rates.revenue_share },
              { label: "CPA", value: rates.cpa },
              { label: "Sub-IB", value: rates.sub_ib },
            ].map((r) => (
              <div key={r.label} className="card-surface p-6">
                <div className="text-2xl font-bold text-brand-300">{r.value}</div>
                <div className="mt-1 text-sm text-slate-400">{r.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Identity: we are a Master IB, you join as a Sub-IB across a whole network */}
      <section className="ambient-section py-16">
        <span
          className="ambient inset-x-1/4 top-0 h-64"
          style={{ background: "radial-gradient(circle, rgba(0,140,255,0.20) 0%, transparent 70%)" }}
          aria-hidden
        />
        <Container>
          <div className="card-surface relative overflow-hidden p-8 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-200">
                  <Network className="h-3.5 w-3.5" aria-hidden />
                  نموذج الوكيل الماستر
                </span>
                <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                  تنضمّ عبرنا كـ <span className="text-gradient">Sub-IB</span> — لا كوكيل
                  لبروكر واحد
                </h2>
                <p className="mt-4 leading-relaxed text-slate-300">
                  نحن لسنا شركة تداول. <span className="font-semibold text-white">FX Partners</span>{" "}
                  وكيل ماستر (Master IB) يملك حسابات شراكة لدى شبكة من الشركات
                  المرخّصة. حين تنضمّ إلينا تصبح وكيلاً فرعياً (Sub-IB) تحت هذه
                  الحسابات — فتربح عمولات من الشبكة كلها عبر جهة واحدة، بدل التفاوض
                  مع كل شركة على حدة.
                </p>
              </div>
              <ul className="space-y-3">
                {[
                  {
                    icon: Building2,
                    title: "شبكة كاملة، جهة واحدة",
                    desc: "عمولات من عدّة شركات مرخّصة عبر حساب ماستر واحد.",
                  },
                  {
                    icon: Scale,
                    title: "شروط أقوى",
                    desc: "بحكم حجمنا كوكيل ماستر نحصل على نسب أفضل نمرّرها إليك.",
                  },
                  {
                    icon: Users,
                    title: "حرية العميل",
                    desc: "عميلك يختار الشركة الأنسب له من الشبكة — وأنت تربح في كل الأحوال.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "لا تعارض",
                    desc: "لسنا بروكر ولا ننافسك على عملائك — دورنا ربطك بالشركات فقط.",
                  },
                ].map((f) => (
                  <li
                    key={f.title}
                    className="flex gap-3 rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/5"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
                      <f.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="font-semibold text-white">{f.title}</div>
                      <p className="mt-0.5 text-sm leading-relaxed text-slate-400">{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="py-16">
        <Container>
          <SectionHeading
            eyebrow="كيف تبدأ"
            icon={Rocket}
            title="ثلاث خطوات تفصلك عن أول عمولة"
            subtitle="من التسجيل إلى استلام أرباحك — رحلة بسيطة وسريعة."
          />

          <div className="relative mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: UserPlus, title: "سجّل مجاناً", desc: "أنشئ حساب شريك في دقيقة واحصل على اعتماد سريع." },
              { icon: Link2, title: "انسخ رابطك", desc: "شارك روابط الإحالة والبانرات الجاهزة مع جمهورك." },
              { icon: Wallet, title: "استلم أرباحك", desc: "تابع أرباحك حيّاً واسحبها بأكثر من طريقة دفع." },
            ].map((s, i) => (
              <div key={s.title} className="card-surface relative p-6 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
                  <s.icon className="h-6 w-6" />
                </div>
                <div className="mt-4 inline-flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white/5 text-xs font-bold text-brand-300">
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading
            eyebrow="الباقات"
            icon={Award}
            title="مستويات الشراكة"
            subtitle="اختر المستوى الذي يناسب حجم شبكتك وطموحك."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`card-surface relative p-8 ${
                  t.highlight ? "border-brand-500/40 shadow-glow" : ""
                }`}
              >
                {t.highlight && (
                  <span className="absolute -top-3 right-6 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
                    الأكثر شيوعاً
                  </span>
                )}
                <h3 className="text-xl font-bold text-white">{t.name}</h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">{t.share}</span>
                  <span className="text-sm text-slate-400">Revenue Share</span>
                </div>
                <div className="mt-1 text-sm text-slate-400">أو CPA حتى {t.cpa}</div>

                <ul className="mt-6 space-y-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button
                    href="/login"
                    variant={t.highlight ? "primary" : "secondary"}
                    className="w-full"
                  >
                    ابدأ الآن
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Why partners choose us */}
      <section className="py-16">
        <Container>
          <SectionHeading
            eyebrow="مزايانا"
            icon={Sparkles}
            title="لماذا يختارنا الوكلاء؟"
            subtitle="كل ما تحتاجه لتنمية دخلك من الإحالات في مكان واحد."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: TrendingUp, title: "نسب أعلى", desc: "حتى 60% من الأرباح وترقية تلقائية للمستوى." },
              { icon: Zap, title: "سحوبات سريعة", desc: "صرف خلال 24 ساعة بأكثر من وسيلة دفع." },
              { icon: Layers, title: "نظام Sub-IB", desc: "اربح من شبكتك عبر نظام متعدد المستويات." },
              { icon: Headphones, title: "دعم عربي", desc: "فريق دعم ومدير حساب يتحدثون لغتك." },
            ].map((b) => (
              <div key={b.title} className="card-surface p-6">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{b.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-12">
        <Container>
          <div className="card-surface relative overflow-hidden p-10 text-center sm:p-14">
            <div className="hero-glow absolute inset-0 opacity-70" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                ابدأ رحلتك كشريك اليوم
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-300">
                انضم لآلاف الوكلاء واحصل على أدوات تسويق احترافية وأرباح شفّافة.
              </p>
              <div className="mt-8 flex justify-center">
                <Button href="/login" className="text-base">
                  إنشاء حساب شريك
                  <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
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
