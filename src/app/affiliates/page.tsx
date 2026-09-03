import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getContent } from "@/lib/content";
import { Check } from "lucide-react";

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
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            برنامج الوكلاء (IB / Affiliate)
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            احصل على أرباح من كل عميل تحيله. اختر بين نسبة من الأرباح (Revenue
            Share) أو مبلغ ثابت لكل عميل مؤهّل (CPA).
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

      <section className="py-16">
        <Container>
          <h2 className="text-center text-3xl font-bold text-white">مستويات الشراكة</h2>
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

      <SiteFooter />
    </>
  );
}
