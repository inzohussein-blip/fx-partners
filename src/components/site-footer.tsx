import { getTranslations } from "next-intl/server";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/logo";
import { getContent } from "@/lib/content";
import { EditableText } from "@/components/admin-edit/editable-text";
import { ChevronDown } from "lucide-react";

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const footer = await getContent("site.footer", { tagline: t("tagline") });

  const groups: { title: string; links: { href: string; label: string }[] }[] = [
    {
      title: t("tools"),
      links: [
        { href: "/compare", label: t("compareBrokers") },
        { href: "/best", label: t("bestFor") },
        { href: "/methodology", label: t("methodology") },
        { href: "/spreads", label: t("spreads") },
        { href: "/tools", label: t("calculators") },
        { href: "/calendar", label: t("calendar") },
        { href: "/free-tools", label: t("freeTools") },
      ],
    },
    {
      title: t("community"),
      links: [
        { href: "/affiliates", label: t("affiliateProgram") },
        { href: "/brokers", label: t("brokersDir") },
        { href: "/forum", label: t("forum") },
        { href: "/offers", label: t("liveOffers") },
        { href: "/blog", label: t("blog") },
      ],
    },
    {
      title: t("account"),
      links: [
        { href: "/about", label: t("about") },
        { href: "/login", label: t("login") },
        { href: "/dashboard", label: t("dashboard") },
        { href: "/contact", label: t("contactUs") },
        { href: "/sitemap", label: t("siteMap") },
      ],
    },
  ];

  return (
    <>
      <footer className="mt-12 border-t border-fg/5 bg-ink-900 sm:mt-24">
        <Container className="grid gap-6 py-10 md:grid-cols-5 md:gap-8 md:py-12">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              <EditableText
                contentKey="site.footer"
                field="tagline"
                label="جملة التذييل"
                multiline
              >
                {footer.tagline}
              </EditableText>
            </p>
          </div>

          {/* Desktop: three link columns. */}
          {groups.map((g) => (
            <div key={g.title} className="hidden md:block">
              <h2 className="text-sm font-semibold text-fg">{g.title}</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-fg">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Phone: the same groups folded. Open, the three lists ran to a
              screen and a half — longer than the content of the short pages
              they sat under. */}
          <div className="divide-y divide-fg/5 rounded-2xl border border-fg/5 md:hidden">
            {groups.map((g) => (
              <details key={g.title} className="group [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex min-h-12 cursor-pointer items-center justify-between px-4 text-sm font-semibold text-fg">
                  {g.title}
                  <ChevronDown className="h-4 w-4 text-slate-500 transition group-open:rotate-180" aria-hidden />
                </summary>
                <ul className="grid grid-cols-2 gap-x-4 px-4 pb-4 text-sm text-slate-400">
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="flex min-h-10 items-center hover:text-fg">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </Container>

        <div className="border-t border-fg/5 py-6">
          <Container className="flex flex-col items-center justify-between gap-3 text-xs text-slate-500 sm:flex-row">
            <p>
              © {new Date().getFullYear()} FX Partners. {t("rights")}
            </p>
            {/* A standalone row of links, not prose, so WCAG 2.5.8's
                inline-link exemption does not apply: each needs to be at
                least 24px high. `py-1.5` gets a 16px line to 28px without
                changing how the row looks. */}
            <div className="flex flex-wrap items-center justify-center gap-x-4">
              <Link href="/terms" className="py-1.5 hover:text-fg">
                {t("terms")}
              </Link>
              <Link href="/privacy" className="py-1.5 hover:text-fg">
                {t("privacy")}
              </Link>
              {/* Reachable from every page, which is what makes withdrawing
                  consent as easy as giving it. */}
              <Link href="/cookies" className="py-1.5 hover:text-fg">
                {t("cookies")}
              </Link>
              <Link href="/payouts" className="py-1.5 hover:text-fg">
                {t("payouts")}
              </Link>
            </div>
          </Container>
          <Container className="mt-3">
            <p className="text-center text-xs leading-relaxed text-slate-500">{t("risk")}</p>
          </Container>
        </div>
      </footer>
      <MobileTabBar />
    </>
  );
}
