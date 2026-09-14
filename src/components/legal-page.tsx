import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";

/**
 * Shared layout for the terms and privacy pages.
 *
 * Both are the same shape — a title, a last-updated line, then numbered
 * sections of one or more paragraphs — so the shape lives here and each page
 * supplies only its namespace and how many paragraphs each of its sections
 * has. Section text is read as `s<n>Title` and `s<n>p<m>` from the catalogue.
 */
export async function LegalPage({
  locale,
  namespace,
  /** Paragraph count per section, in order. */
  shape,
  /**
   * When the text was last revised. A legal page that stamps itself with
   * today's date on every render tells the reader it changed when it did not,
   * so this is a fixed date that moves only when the wording does.
   */
  updated,
}: {
  locale: string;
  namespace: "Terms" | "Privacy";
  shape: readonly number[];
  updated: string;
}) {
  const t = await getTranslations({ locale, namespace });
  const date = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ar", {
    dateStyle: "long",
  }).format(new Date(`${updated}T00:00:00Z`));

  return (
    <>
      <SiteHeader />
      <section className="py-14">
        <Container className="max-w-3xl">
          <Breadcrumbs items={[{ label: t("h1") }]} />
          <h1 className="mt-6 text-3xl font-extrabold text-fg sm:text-4xl">{t("h1")}</h1>
          <p className="mt-3 text-sm text-slate-500">{t("lastUpdated", { date })}</p>

          <div className="mt-10 space-y-8">
            {shape.map((paragraphs, i) => {
              const n = i + 1;
              return (
                <section key={n}>
                  <h2 className="text-lg font-semibold text-fg">{t(`s${n}Title`)}</h2>
                  {Array.from({ length: paragraphs }, (_, j) => (
                    <p key={j} className="mt-2 text-sm leading-relaxed text-slate-400">
                      {t(`s${n}p${j + 1}`)}
                    </p>
                  ))}
                </section>
              );
            })}
          </div>
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
