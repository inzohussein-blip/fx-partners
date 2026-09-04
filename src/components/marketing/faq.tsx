import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Plus, HelpCircle } from "lucide-react";

export function Faq() {
  const t = useTranslations("Faq");
  const items = [1, 2, 3, 4, 5] as const;

  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-3xl">
        <SectionHeading
          eyebrow={t("badge")}
          icon={HelpCircle}
          title={t("heading")}
          subtitle={t("subheading")}
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
