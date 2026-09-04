import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  const t = useTranslations("Footer");

  return (
    <footer className="mt-24 border-t border-white/5 bg-ink-900">
      <Container className="grid gap-8 py-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            {t("tagline")}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">{t("tools")}</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link href="/compare" className="hover:text-white">{t("compareBrokers")}</Link></li>
            <li><Link href="/offers" className="hover:text-white">{t("liveOffers")}</Link></li>
            <li><Link href="/tools" className="hover:text-white">{t("calculators")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">{t("partnership")}</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link href="/affiliates" className="hover:text-white">{t("affiliateProgram")}</Link></li>
            <li><Link href="/brokers" className="hover:text-white">{t("companyCollab")}</Link></li>
            <li><Link href="/blog" className="hover:text-white">{t("blog")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">{t("account")}</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link href="/login" className="hover:text-white">{t("login")}</Link></li>
            <li><Link href="/dashboard" className="hover:text-white">{t("dashboard")}</Link></li>
            <li><Link href="/sitemap" className="hover:text-white">{t("siteMap")}</Link></li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/5 py-6">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} FX Partners. {t("rights")}</p>
          <p className="max-w-xl text-center sm:text-start">{t("risk")}</p>
        </Container>
      </div>
    </footer>
  );
}
