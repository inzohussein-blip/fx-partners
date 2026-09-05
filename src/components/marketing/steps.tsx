import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { UserPlus, Link2, Wallet, Rocket } from "lucide-react";

const STEPS = [
  { key: "signup", icon: UserPlus },
  { key: "share", icon: Link2 },
  { key: "earn", icon: Wallet },
] as const;

/** Broker-style "start in 3 steps" band — a core conversion section. */
export function Steps() {
  const t = useTranslations("Steps");

  return (
    <section className="border-y border-white/5 bg-ink-900/40 py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow={t("badge")}
          icon={Rocket}
          title={t("heading")}
          subtitle={t("subheading")}
        />

        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          {/* connecting line behind the cards (desktop) */}
          <div
            className="absolute inset-x-0 top-[52px] hidden h-px bg-gradient-to-l from-transparent via-brand-500/30 to-transparent md:block"
            aria-hidden
          />
          {STEPS.map((s, i) => (
            <div key={s.key} className="relative text-center">
              <div className="relative mx-auto grid h-[104px] w-[104px] place-items-center">
                <div className="absolute inset-0 rounded-full bg-brand-500/5 blur-xl" />
                <div className="relative grid h-[104px] w-[104px] place-items-center rounded-full border border-white/[0.06] bg-ink-800">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-gradient text-white shadow-glow">
                    <s.icon className="h-6 w-6" />
                  </span>
                </div>
                <span className="absolute -top-1 right-1 grid h-7 w-7 place-items-center rounded-full bg-ink-900 text-xs font-bold text-brand-300 ring-1 ring-brand-500/30">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">
                {t(`${s.key}.title`)}
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-400">
                {t(`${s.key}.desc`)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button href="/login" className="text-base">
            {t("cta")}
          </Button>
        </div>
      </Container>
    </section>
  );
}
