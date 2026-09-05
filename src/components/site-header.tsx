import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { MoreMenu } from "@/components/more-menu";

export function SiteHeader() {
  const t = useTranslations("Nav");

  // Primary links stay in the top bar; everything else collapses into "More".
  const primary = [
    { href: "/", label: t("home") },
    { href: "/affiliates", label: t("affiliates") },
    { href: "/brokers", label: t("brokers") },
    { href: "/forum", label: t("forum") },
    { href: "/blog", label: t("blog") },
  ];

  const more = [
    { href: "/compare", label: t("compare") },
    { href: "/spreads", label: t("spreads") },
    { href: "/tools", label: t("tools") },
    { href: "/calendar", label: t("calendar") },
    { href: "/free-tools", label: t("resources") },
    { href: "/offers", label: t("offers") },
  ];

  // Mobile drawer shows the full list.
  const allNav = [...primary, ...more];

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-900/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <MoreMenu label={t("more")} items={more} />
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <Button href="/login" variant="ghost" className="hidden sm:inline-flex">
            {t("login")}
          </Button>
          <Button href="/login" className="hidden md:inline-flex">
            {t("dashboard")}
          </Button>
          <MobileNav
            items={allNav}
            loginLabel={t("login")}
            dashboardLabel={t("dashboard")}
          />
        </div>
      </Container>
    </header>
  );
}
