import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { Plus } from "lucide-react";

export function Faq() {
  const t = useTranslations("Faq");
  const items = [1, 2, 3, 4, 5] as const;

  return (
    <section className="py-20">
      <Container className="max-w-3xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {t("heading")}
          </h2>
          <p className="mt-4 text-slate-400">{t("subheading")}</p>
        </div>

        <div className="mt-12 space-y-3">
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
