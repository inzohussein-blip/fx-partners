import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  Handshake,
  Layers,
  Wallet,
  Headphones,
  Users,
  Share2,
  ArrowLeft,
  Workflow,
} from "lucide-react";

/**
 * "How we work" — the identity section. Explains what a master IB actually
 * does (negotiate, pool, split, support) as a numbered flow, then routes the
 * two audiences (trader / IB) to their path.
 */
export async function HowItWorks() {
  const t = await getTranslations("HowItWorks");

  const steps = [
    { icon: Handshake, key: "s1" },
    { icon: Layers, key: "s2" },
    { icon: Wallet, key: "s3" },
    { icon: Headphones, key: "s4" },
  ] as const;

  return (
    <section className="ambient-section py-16 sm:py-24">
      <span
        className="ambient inset-x-1/4 top-8 h-72"
        style={{ background: "radial-gradient(circle, rgba(0,144,252,0.20) 0%, transparent 70%)" }}
        aria-hidden
      />
      <Container>
        <SectionHeading
          eyebrow={t("badge")}
          icon={Workflow}
          title={t("heading")}
          subtitle={t("subheading")}
        />

        {/* The four things a master IB does */}
        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li
              key={s.key}
              className="card-surface group relative p-6 transition hover:-translate-y-0.5 hover:ring-1 hover:ring-brand-500/30"
            >
              <span className="absolute end-5 top-5 text-4xl font-black leading-none text-white/[0.06]">
                {i + 1}
              </span>
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20 transition group-hover:bg-brand-500/20">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-white">{t(`${s.key}Title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{t(`${s.key}Desc`)}</p>
            </li>
          ))}
        </ol>

        {/* Two audience routes */}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <RoleCard
            icon={Users}
            title={t("roleClientTitle")}
            desc={t("roleClientDesc")}
            href="/compare"
            cta={t("roleClientTitle")}
          />
          <RoleCard
            icon={Share2}
            title={t("roleAgentTitle")}
            desc={t("roleAgentDesc")}
            href="/affiliates"
            cta={t("roleAgentTitle")}
            accent
          />
        </div>
      </Container>
    </section>
  );
}

function RoleCard({
  icon: Icon,
  title,
  desc,
  href,
  accent,
}: {
  icon: typeof Users;
  title: string;
  desc: string;
  href: string;
  cta: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`card-surface group relative flex items-start gap-4 overflow-hidden p-6 transition hover:-translate-y-0.5 hover:ring-1 ${
        accent ? "hover:ring-accent-500/40" : "hover:ring-brand-500/40"
      }`}
    >
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ring-1 ${
          accent
            ? "bg-accent-500/10 text-accent-300 ring-accent-400/25"
            : "bg-brand-500/10 text-brand-300 ring-brand-500/20"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{desc}</p>
        <span
          className={`mt-3 inline-flex items-center gap-1 text-sm font-semibold transition group-hover:gap-2 ${
            accent ? "text-accent-300" : "text-brand-300"
          }`}
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
        </span>
      </div>
    </Link>
  );
}
