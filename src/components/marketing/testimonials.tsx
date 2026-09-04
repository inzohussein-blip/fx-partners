"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { Carousel } from "@/components/ui/carousel";
import { SectionHeading } from "@/components/ui/section-heading";
import { Quote, MessageSquareQuote } from "lucide-react";

export function Testimonials() {
  const t = useTranslations("Testimonials");
  const items = ["one", "two", "three"] as const;

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow={t("badge")}
          icon={MessageSquareQuote}
          title={t("heading")}
          subtitle={t("subheading")}
        />

        <div className="mt-12">
          <Carousel
            autoPlayMs={6000}
            slideClass="basis-[88%] sm:basis-[60%] lg:basis-[38%]"
            items={items.map((key) => (
              <figure
                key={key}
                className="card-surface flex h-full flex-col p-8"
              >
                <Quote className="h-8 w-8 text-brand-400" />
                <blockquote className="mt-5 flex-1 text-base leading-relaxed text-slate-200">
                  {t(`${key}.quote`)}
                </blockquote>
                <figcaption className="mt-6 border-t border-white/5 pt-5">
                  <div className="font-semibold text-white">{t(`${key}.name`)}</div>
                  <div className="text-xs text-brand-300">{t(`${key}.role`)}</div>
                </figcaption>
              </figure>
            ))}
          />
        </div>
      </Container>
    </section>
  );
}
