import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { Quote } from "lucide-react";

export function Testimonials() {
  const t = useTranslations("Testimonials");
  const items = ["one", "two", "three"] as const;

  return (
    <section className="py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {t("heading")}
          </h2>
          <p className="mt-4 text-slate-400">{t("subheading")}</p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {items.map((key) => (
            <figure key={key} className="card-surface flex flex-col p-6">
              <Quote className="h-6 w-6 text-brand-400" />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-300">
                {t(`${key}.quote`)}
              </blockquote>
              <figcaption className="mt-6 border-t border-white/5 pt-4">
                <div className="font-semibold text-white">{t(`${key}.name`)}</div>
                <div className="text-xs text-brand-300">{t(`${key}.role`)}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
