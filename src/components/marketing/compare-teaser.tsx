import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { createClient } from "@/lib/supabase/server";
import { ComparePicker } from "@/components/marketing/compare-picker";
import { SlidersHorizontal, Wallet, MonitorSmartphone, ShieldCheck, Scale } from "lucide-react";

async function getBrokerOptions(): Promise<{ slug: string; name: string }[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("brokers")
      .select("slug,name")
      .eq("is_published", true)
      .order("rating", { ascending: false })
      .order("sort_order");
    return (data as { slug: string; name: string }[] | null) ?? [];
  } catch {
    return [];
  }
}

/**
 * Homepage "Compare Brokers" teaser (per the brand mockup): a picker panel to
 * choose two brokers and jump into the full head-to-head, flanked by the four
 * comparison dimensions. Needs at least two brokers to be useful.
 */
export async function CompareTeaser() {
  const t = await getTranslations("CompareTeaser");
  const options = await getBrokerOptions();
  if (options.length < 2) return null;

  const features = [
    { icon: SlidersHorizontal, t: t("f1t"), d: t("f1d") },
    { icon: Wallet, t: t("f2t"), d: t("f2d") },
    { icon: MonitorSmartphone, t: t("f3t"), d: t("f3d") },
    { icon: ShieldCheck, t: t("f4t"), d: t("f4d") },
  ];

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="grid items-stretch gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Left: heading + picker */}
          <div className="card-surface flex flex-col p-7 sm:p-8">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
              <Scale className="h-3.5 w-3.5" />
              {t("badge")}
            </span>
            <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">{t("heading")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{t("subheading")}</p>
            <div className="mt-6">
              <ComparePicker options={options} />
            </div>
          </div>

          {/* Right: the four comparison dimensions */}
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.t}
                className="card-surface flex items-start gap-3.5 p-5 transition hover:-translate-y-0.5 hover:ring-1 hover:ring-brand-500/25"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">{f.t}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
