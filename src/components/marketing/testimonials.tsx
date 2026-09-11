import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Carousel } from "@/components/ui/carousel";
import { SectionHeading } from "@/components/ui/section-heading";
import { getContent } from "@/lib/content";
import { Quote, MessageSquareQuote } from "lucide-react";

type Testimonial = { quote: string; name: string; role: string };

/**
 * Partner testimonials.
 *
 * These used to be three hard-coded quotes attributed to named people
 * ("أحمد الشمري", "سارة عبدالله") and a company, under a heading that calls
 * them "تجارب حقيقية" — real experiences. They were not: they were placeholder
 * copy in the message catalogue, shipped to production on a financial site.
 * Invented testimonials are both a trust problem and, under Google's spam
 * policies, a ranking liability.
 *
 * The section now reads real testimonials from the editable `home.testimonials`
 * content block and renders nothing until there is at least one. Add them from
 * the admin content editor as you collect them, shaped as:
 *
 *   { "items": [ { "quote": "...", "name": "...", "role": "..." } ] }
 */
export async function Testimonials() {
  const t = await getTranslations("Testimonials");
  const { items } = await getContent<{ items: Testimonial[] }>(
    "home.testimonials",
    { items: [] }
  );

  const real = (Array.isArray(items) ? items : []).filter(
    (i) => i && typeof i.quote === "string" && i.quote.trim().length > 0
  );
  if (real.length === 0) return null;

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
            items={real.map((item, i) => (
              <figure key={i} className="card-surface flex h-full flex-col p-8">
                <Quote className="h-8 w-8 text-brand-400" />
                <blockquote className="mt-5 flex-1 text-base leading-relaxed text-slate-200">
                  {item.quote}
                </blockquote>
                <figcaption className="mt-6 border-t border-white/5 pt-5">
                  <div className="font-semibold text-white">{item.name}</div>
                  {item.role && (
                    <div className="text-xs text-brand-300">{item.role}</div>
                  )}
                </figcaption>
              </figure>
            ))}
          />
        </div>
      </Container>
    </section>
  );
}
