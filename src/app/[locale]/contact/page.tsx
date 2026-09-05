import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactForm } from "@/components/marketing/contact-form";
import { Mail, Phone, Clock, MessageCircle } from "lucide-react";
import { getContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "اتصل بنا",
  description: "تواصل مع فريق FX Partners — الدعم، الشراكات، والاستفسارات على مدار الساعة.",
};

export default async function ContactPage() {
  const info = await getContent("site.contact", {
    email: "partners@fxpartners.com",
    phone: "+971 4 000 0000",
    hours: "24/7 دعم متواصل",
  });

  const channels = [
    { icon: Mail, label: "البريد الإلكتروني", value: info.email, href: `mailto:${info.email}` },
    { icon: Phone, label: "الهاتف", value: info.phone, href: `tel:${info.phone.replace(/\s/g, "")}` },
    { icon: Clock, label: "ساعات العمل", value: info.hours },
  ];

  return (
    <>
      <SiteHeader />

      <section className="hero-glow">
        <Container className="py-14">
          <Breadcrumbs items={[{ label: "اتصل بنا" }]} />
          <div className="mt-6 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              تواصل معنا
            </span>
            <h1 className="mt-5 text-4xl font-extrabold text-white sm:text-5xl">
              لديك سؤال أو عرض شراكة؟
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              فريقنا جاهز لمساعدتك على مدار الساعة. أرسل رسالتك أو تواصل مباشرة عبر
              القنوات التالية.
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
                      <div dir="ltr" className="font-medium text-white">
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

      <SiteFooter />
    </>
  );
}
