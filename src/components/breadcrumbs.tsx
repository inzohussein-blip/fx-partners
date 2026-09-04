import { Link } from "@/i18n/navigation";
import { getSiteUrl } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

export type Crumb = { label: string; href?: string };

/**
 * Visible breadcrumb trail + BreadcrumbList JSON-LD for search engines.
 * A leading "الرئيسية" (home) crumb is added automatically.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: "الرئيسية", href: "/" }, ...items];
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
    <nav aria-label="مسار التنقّل" className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {all.map((c, i) => {
        const last = i === all.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronLeft className="h-3.5 w-3.5 text-slate-600" />}
            {c.href && !last ? (
              <Link href={c.href} className="transition hover:text-brand-300">
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
