import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getContent } from "@/lib/content";
import { Plus, HelpCircle } from "lucide-react";

export async function Faq() {
  const t = await getTranslations("Faq");
  const items = [1, 2, 3, 4, 5] as const;
  const copy = await getContent("home.faq", {
    title: t("heading"),
    subtitle: t("subheading"),
  });

  // FAQPage structured data, built from the same strings the section renders.
  // Google requires the markup to match the visible answers exactly, so it is
  // derived from `t` rather than written out a second time.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: t(`q${i}`),
      acceptedAnswer: { "@type": "Answer", text: t(`a${i}`) },
    })),
  };

  return (
    <section className="py-16 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Container className="max-w-3xl">
        <SectionHeading
          eyebrow={t("badge")}
          icon={HelpCircle}
          title={copy.title}
          subtitle={copy.subtitle}
        />

        <div className="mt-10 space-y-3">
          {items.map((i) => (
            <details
              key={i}
              className="card-surface group px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium text-white">
                {t(`q${i}`)}
                <Plus className="h-4 w-4 shrink-0 text-brand-400 transition group-open:rotate-45" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {t(`a${i}`)}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
