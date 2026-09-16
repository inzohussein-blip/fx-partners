import { getTranslations } from "next-intl/server";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/logo";
import { getContent } from "@/lib/content";
import { EditableText } from "@/components/admin-edit/editable-text";

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const footer = await getContent("site.footer", { tagline: t("tagline") });

  return (
    <>
      <footer className="mt-24 border-t border-fg/5 bg-ink-900">
        <Container className="grid gap-8 py-12 md:grid-cols-5">
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

          <div>
            <h2 className="text-sm font-semibold text-fg">{t("tools")}</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/compare" className="hover:text-fg">
                  {t("compareBrokers")}
                </Link>
              </li>
              <li>
                <Link href="/best" className="hover:text-fg">
                  {t("bestFor")}
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="hover:text-fg">
                  {t("methodology")}
                </Link>
              </li>
              <li>
                <Link href="/spreads" className="hover:text-fg">
                  {t("spreads")}
                </Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-fg">
                  {t("calculators")}
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-fg">
                  {t("calendar")}
                </Link>
              </li>
              <li>
                <Link href="/free-tools" className="hover:text-fg">
                  {t("freeTools")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-fg">
              {t("community")}
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/affiliates" className="hover:text-fg">
                  {t("affiliateProgram")}
                </Link>
              </li>
              <li>
                <Link href="/brokers" className="hover:text-fg">
                  {t("brokersDir")}
                </Link>
              </li>
              <li>
                <Link href="/forum" className="hover:text-fg">
                  {t("forum")}
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-fg">
                  {t("liveOffers")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-fg">
                  {t("blog")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-fg">{t("account")}</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/about" className="hover:text-fg">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-fg">
                  {t("login")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-fg">
                  {t("dashboard")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-fg">
                  {t("contactUs")}
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="hover:text-fg">
                  {t("siteMap")}
                </Link>
              </li>
            </ul>
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
