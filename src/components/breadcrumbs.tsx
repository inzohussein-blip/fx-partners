import { useTranslations } from "next-intl";
import { jsonLdScript } from "@/lib/jsonld";
import { Link } from "@/i18n/navigation";
import { getSiteUrl } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

export type Crumb = { label: string; href?: string };

/**
 * Visible breadcrumb trail + BreadcrumbList JSON-LD for search engines.
 * A leading home crumb is added automatically, in the reader's language.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const t = useTranslations("Chrome");
  const all: Crumb[] = [{ label: t("home"), href: "/" }, ...items];
  const base = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${base}${c.href === "/" ? "" : c.href}` } : {}),
    })),
  };

  return (
    <nav aria-label={t("breadcrumbLabel")} className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      {all.map((c, i) => {
        const last = i === all.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronLeft className="h-3.5 w-3.5 text-slate-600" />}
            {c.href && !last ? (
              <Link
                href={c.href}
                className="inline-flex min-h-6 items-center transition hover:text-brand-300"
              >
                {c.label}
              </Link>
            ) : (
              <span className={last ? "text-slate-300" : ""}>{c.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
