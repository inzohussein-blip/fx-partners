import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";

type Partner = { id: string; name: string; logo_url: string | null };

const fallback: Partner[] = [
  { id: "f1", name: "Global Markets", logo_url: null },
  { id: "f2", name: "LiquidBridge", logo_url: null },
  { id: "f3", name: "TradeTech", logo_url: null },
  { id: "f4", name: "NovaFX", logo_url: null },
  { id: "f5", name: "PrimeLiquidity", logo_url: null },
  { id: "f6", name: "MetaBrokers", logo_url: null },
];

export function LogoCarousel({ partners }: { partners: Partner[] }) {
  const t = useTranslations("TrustedBy");
  const items = partners.length ? partners : fallback;
  // Duplicate the list so the marquee can loop seamlessly.
  const loop = [...items, ...items];

  return (
    <section className="border-y border-white/5 bg-ink-800/30 py-10">
      <Container>
        <p className="text-center text-xs font-medium uppercase tracking-widest text-slate-500">
          {t("label")}
        </p>
        <div className="marquee-group marquee-mask mt-6 overflow-hidden" dir="ltr">
          <div className="animate-marquee flex items-center gap-14">
            {loop.map((p, i) => (
              <div key={`${p.id}-${i}`} className="shrink-0">
                {p.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.logo_url}
                    alt={p.name}
                    className="h-7 opacity-50 grayscale transition"
                  />
                ) : (
                  <span className="whitespace-nowrap text-lg font-semibold tracking-tight text-slate-500">
                    {p.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
