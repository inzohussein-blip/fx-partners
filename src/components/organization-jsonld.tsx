import { getSiteUrl } from "@/lib/utils";

/** Site-wide Organization + WebSite structured data for the homepage. */
export function OrganizationJsonLd() {
  const base = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: "FX Partners",
        url: base,
        logo: `${base}/api/banner?size=rectangle`,
        description:
          "منصة شراكة مالية تربط الوكلاء والمسوّقين بأفضل شركات التداول العالمية.",
        sameAs: [],
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: "FX Partners",
        publisher: { "@id": `${base}/#organization` },
        inLanguage: "ar",
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
