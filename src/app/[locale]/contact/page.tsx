import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactForm } from "@/components/marketing/contact-form";
import { Mail, Phone, Clock, MessageCircle } from "lucide-react";
import { getContent, contentKeyFor } from "@/lib/content";
import { PageSections } from "@/components/page-sections/page-sections";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale, namespace: "ContactPage" });
  return pageMeta({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/contact",
    locale,
  });
}

export default async function ContactPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ContactPage" });
  // The address and number are the same in both locales; only the opening
  // hours are prose, so that is the one field the locale key exists for.
  //
  // No made-up defaults: this page used to show partners@fxpartners.com (a
  // domain the site does not own) and +971 4 000 0000 (a placeholder) as if
  // they were real. A channel shows only once it is set, either in the admin
  // content editor (site.contact) or with NEXT_PUBLIC_CONTACT_EMAIL /
  // NEXT_PUBLIC_CONTACT_PHONE. Until then the form is the way in.
  const info = await getContent(contentKeyFor("site.contact", locale), {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ?? "",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() ?? "",
    hours: t("defaultHours"),
  });
  // The old placeholders may already be saved in site.contact, so they are
  // refused here too.
  const email =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email ?? "") && !/@fxpartners\.com$/i.test(info.email)
      ? info.email
      : "";
  const digits = (info.phone ?? "").replace(/\D/g, "");
  const phone = digits.length >= 6 && !/0{6,}/.test(digits) ? info.phone : "";

  const channels = [
    ...(email ? [{ icon: Mail, label: t("email"), value: email, href: `mailto:${email}` }] : []),
    ...(phone ? [{ icon: Phone, label: t("phone"), value: phone, href: `tel:${phone.replace(/\s/g, "")}` }] : []),
    { icon: Clock, label: t("hours"), value: info.hours },
  ];

  return (
    <>
      <SiteHeader />
      {/* Custom sections can be added around this content: dashboard → Pages. */}
      <PageSections
        page="contact"
        locale={locale}
        builtins={{
          content: (
            <>
            <section className="hero-glow">
              <Container className="py-14">
                <Breadcrumbs items={[{ label: t("crumb") }]} />
                <div className="mt-6 max-w-2xl">
                  <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                    {t("eyebrow")}
                  </span>
                  <h1 className="mt-5 text-[26px] font-extrabold leading-[1.3] text-fg sm:text-4xl sm:leading-tight lg:text-5xl">
                    {t("title")}
                  </h1>
                  <p className="mt-4 text-lg text-slate-300">
                    {t("subtitle")}
                  </p>
                </div>
              </Container>
            </section>

            <section className="pb-24">
              <Container>
                <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                  <ContactForm />

                  <aside className="space-y-4">
                    {channels.map((c) => {
                      const inner = (
                        <>
                          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
                            <c.icon className="h-5 w-5" aria-hidden />
                          </div>
                          <div>
                            <div className="text-xs text-slate-500">{c.label}</div>
                            <div dir="ltr" className="font-medium text-fg">
                              {c.value}
                            </div>
                          </div>
                        </>
                      );
                      return c.href ? (
                        <a
                          key={c.label}
                          href={c.href}
                          className="card-surface flex items-center gap-4 p-4 transition hover:ring-1 hover:ring-brand-500/30"
                        >
                          {inner}
                        </a>
                      ) : (
                        <div key={c.label} className="card-surface flex items-center gap-4 p-4">
                          {inner}
                        </div>
                      );
                    })}
                  </aside>
                </div>
              </Container>
            </section>
            </>
          ),
        }}
      />
      <SiteFooter />
    </>
  );
}
