import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Clock } from "lucide-react";

const EMAIL = "partners@fxpartners.com";
const PHONE = "+971 4 000 0000";

export function Contact() {
  const t = useTranslations("Contact");

  const channels = [
    { icon: Mail, label: t("emailLabel"), value: EMAIL },
    { icon: Phone, label: t("phoneLabel"), value: PHONE },
    { icon: Clock, label: t("hoursLabel"), value: t("hoursValue") },
  ];

  return (
    <section id="contact" className="py-20">
      <Container>
        <div className="card-surface relative overflow-hidden p-10 sm:p-14">
          <div className="hero-glow absolute inset-0 opacity-60" />
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
                {t("badge")}
              </span>
              <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
                {t("heading")}
              </h2>
              <p className="mt-4 text-slate-300">{t("subheading")}</p>
              <div className="mt-8">
                <a href={`mailto:${EMAIL}`}>
                  <Button className="text-base">
                    <Mail className="h-4 w-4" />
                    {t("cta")}
                  </Button>
                </a>
              </div>
            </div>

            <div className="grid gap-4">
              {channels.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-ink-900/40 p-4"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-500/10 text-brand-300">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">{c.label}</div>
                    <div dir="ltr" className="font-medium text-white">
                      {c.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
