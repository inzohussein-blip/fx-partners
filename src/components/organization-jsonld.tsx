import { getSiteUrl } from "@/lib/utils";
import { SITE, sameAs } from "@/lib/seo";

/**
 * Site-wide Organization + WebSite structured data.
 *
 * This is the entity record: the thing that lets Google, Bing and the answer
 * engines decide that "FX Partners" is one known organisation rather than a
 * string that happens to appear on some pages. Two details carry most of the
 * weight:
 *
 *   - `@type` is Organization, never FinancialService or Broker. We are an
 *     intermediary; claiming a financial-service type in structured data is a
 *     claim to be regulated as one, and we are not.
 *   - `sameAs` is empty until real profile URLs are configured. An aspirational
 *     link there points a crawler at a profile we do not control, which is
 *     worse than no link at all.
 */
export function OrganizationJsonLd({ locale = "ar" }: { locale?: string }) {
  const base = getSiteUrl();
  const profiles = sameAs();
  const lang = locale === "en" ? "en" : "ar";

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: SITE.name,
        alternateName: SITE.alternateName,
        url: base,
        logo: {
          "@type": "ImageObject",
          url: `${base}/api/banner?size=rectangle`,
        },
        image: `${base}/api/banner?size=wide`,
        description: SITE.description[lang],
        slogan: SITE.tagline[lang],
        knowsLanguage: SITE.languages,
        areaServed: SITE.areaServed.map((c) => ({ "@type": "Country", identifier: c })),
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          availableLanguage: ["ar", "en"],
          url: `${base}/contact`,
        },
        ...(profiles.length ? { sameAs: profiles } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: SITE.name,
        alternateName: SITE.alternateName,
        description: SITE.description[lang],
        publisher: { "@id": `${base}/#organization` },
        inLanguage: SITE.languages,
        // Points at the broker directory's real, URL-backed search parameter —
        // /compare?q=… actually filters, so this action is one a crawler or an
        // agent can follow rather than a decorative declaration.
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${base}/compare?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
