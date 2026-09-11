import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { createClient } from "@/lib/supabase/server";
import { ShieldCheck, Building2, ArrowLeft } from "lucide-react";

type Broker = { name: string; slug: string; logo_url: string | null };

async function getBrokers(): Promise<Broker[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("brokers")
      .select("name,slug,logo_url")
      .eq("is_published", true)
      .order("sort_order")
      .limit(12);
    return (data as Broker[] | null) ?? [];
  } catch {
    return [];
  }
}

/**
 * Proof band right under the hero: the licensed brokers we connect to. Real
 * partner logos are the strongest evidence that we're the intermediary, not a
 * broker. Renders skeleton tiles when the directory is empty.
 */
export async function BrokerNetwork() {
  const t = await getTranslations("BrokerNetwork");
  const brokers = await getBrokers();
  const items: (Broker | null)[] =
    brokers.length > 0 ? brokers : Array.from({ length: 8 }, () => null);

  // The band adapts to how many brokers are actually listed: a static grid
  // reads better (and links better) for a handful, while a scrolling marquee
  // is what a long roster needs. Eight is where a loop stops stuttering.
  const marquee = brokers.length >= 8;
  const track: (Broker | null)[] = marquee ? [...brokers, ...brokers] : items;

  return (
    <section className="border-y border-white/[0.06] bg-white/[0.015] py-10">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              شبكة مرخّصة
            </span>
            <h2 className="mt-3 text-xl font-bold leading-snug text-white sm:text-2xl">
              {t("heading")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{t("subheading")}</p>
            <Link
              href="/brokers"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 transition hover:gap-2.5 hover:text-brand-200"
            >
              {t("cta")}
              <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
            </Link>
          </div>

          {marquee ? (
            <div className="marquee-group marquee-mask min-w-0 flex-1 overflow-hidden lg:max-w-2xl">
              <div className="animate-marquee flex items-center gap-3">
                {track.map((b, i) => (
                  <div key={`${b?.slug ?? i}-${i}`} className="w-40 shrink-0">
                    <BrokerTile
                      broker={b}
                      /* The second copy exists only to close the loop
                         seamlessly — it must not be read out twice or become a
                         duplicate tab stop. */
                      duplicate={i >= brokers.length}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:max-w-2xl lg:grid-cols-4">
              {items.map((b, i) => (
                <BrokerTile key={b?.slug ?? i} broker={b} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

function BrokerTile({
  broker,
  duplicate = false,
}: {
  broker: Broker | null;
  duplicate?: boolean;
}) {
  const inner = (
    <div className="flex h-16 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 backdrop-blur-md transition hover:border-white/20 hover:bg-white/[0.06]">
      {broker?.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={broker.logo_url}
          alt={broker.name}
          className="max-h-9 max-w-[80%] object-contain"
          loading="lazy"
        />
      ) : broker ? (
        <span className="truncate text-sm font-bold text-slate-200">{broker.name}</span>
      ) : (
        <span className="flex items-center gap-2 text-slate-600">
          <Building2 className="h-4 w-4" />
          <span className="h-2 w-14 rounded-full bg-white/10" />
        </span>
      )}
    </div>
  );
  if (!broker) return inner;
  return (
    <Link
      href={`/brokers/${broker.slug}`}
      title={broker.name}
      aria-hidden={duplicate || undefined}
      tabIndex={duplicate ? -1 : undefined}
    >
      {inner}
    </Link>
  );
}
