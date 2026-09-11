import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { createClient } from "@/lib/supabase/server";

type Partner = { name: string; slug: string; logo_url: string | null };

/**
 * Partner logo marquee.
 *
 * This component used to ship six invented broker names ("Global Markets",
 * "NovaFX", …) as a fallback under a "trusted by partners worldwide" label.
 * On a broker-comparison site that is fabricated social proof: a visitor reads
 * it as a list of real partners, and a search engine reads it as an entity
 * claim. It now renders only brokers that are actually in the directory, and
 * nothing at all when there are none — an empty strip is honest, a fake one is
 * not.
 *
 * Each logo links to its broker page, so the strip also does real work as an
 * internal-linking surface rather than being decorative.
 */
async function getPartners(): Promise<Partner[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("brokers")
      .select("name,slug,logo_url,status")
      .eq("is_published", true)
      // Contracted partners lead; the rest of the published directory follows.
      .order("status", { ascending: true })
      .order("sort_order")
      .limit(20);
    return (data as Partner[] | null) ?? [];
  } catch {
    return [];
  }
}

export async function LogoCarousel() {
  const t = await getTranslations("TrustedBy");
  const items = await getPartners();
  if (items.length === 0) return null;

  // A marquee needs enough width to loop without visible gaps; below that the
  // list is simply centred and static, which reads better than a stutter.
  const marquee = items.length >= 8;
  const loop = marquee ? [...items, ...items] : items;

  return (
    <section className="border-y border-white/5 bg-ink-800/30 py-10">
      <Container>
        <p className="text-center text-xs font-medium uppercase tracking-widest text-slate-500">
          {t("label")}
        </p>
        <div
          className={
            marquee ? "marquee-group marquee-mask mt-6 overflow-hidden" : "mt-6"
          }
          dir="ltr"
        >
          <div
            className={`flex items-center gap-14 ${
              marquee ? "animate-marquee" : "flex-wrap justify-center"
            }`}
          >
            {loop.map((p, i) => (
              <Link
                key={`${p.slug}-${i}`}
                href={`/brokers/${p.slug}`}
                className="shrink-0 opacity-60 transition hover:opacity-100"
                title={p.name}
                aria-hidden={marquee && i >= items.length}
                tabIndex={marquee && i >= items.length ? -1 : undefined}
              >
                {p.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    loading="lazy"
                    decoding="async"
                    src={p.logo_url}
                    alt={p.name}
                    className="h-7 grayscale transition hover:grayscale-0"
                  />
                ) : (
                  <span className="whitespace-nowrap text-lg font-semibold tracking-tight text-slate-400">
                    {p.name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
