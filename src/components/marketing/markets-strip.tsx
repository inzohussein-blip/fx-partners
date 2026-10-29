import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { INDICATORS } from "@/lib/indicators";
import { CandlestickChart, Newspaper, CalendarDays, ArrowLeft } from "lucide-react";

/**
 * Home-page way into the market pages: live markets, the indicator guides and
 * the calendar. Plain links, no embeds, so it adds nothing to the home page's
 * load and needs no consent.
 */
export async function MarketsStrip({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "MarketsStrip" });
  const cards = [
    { href: "/markets", icon: CandlestickChart, title: t("marketsTitle"), body: t("marketsBody") },
    { href: "/indicators", icon: Newspaper, title: t("indicatorsTitle"), body: t("indicatorsBody") },
    { href: "/calendar", icon: CalendarDays, title: t("calendarTitle"), body: t("calendarBody") },
  ];

  return (
    <section className="py-14 sm:py-16">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} icon={CandlestickChart} title={t("title")} subtitle={t("subtitle")} />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map(({ href, icon: Icon, title, body }) => (
            <Link
              key={href}
              href={href}
              className="card-surface group flex flex-col p-6 transition hover:border-brand-400/40"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-bold text-fg">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{body}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 group-hover:text-brand-200">
                {t("open")}
                <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2" dir="ltr">
          {INDICATORS.map((i) => (
            <Link
              key={i.slug}
              href={`/indicators/${i.slug}`}
              className="rounded-full border border-fg/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-brand-400/40 hover:text-fg"
            >
              {i.code}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
