import { Container } from "@/components/ui/container";

type Partner = { id: string; name: string; logo_url: string | null };

export function LogoCloud({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) return null;

  return (
    <section className="border-y border-white/5 bg-ink-800/30 py-10">
      <Container>
        <p className="text-center text-xs font-medium uppercase tracking-widest text-slate-500">
          موثوق من شركاء وشركات تداول حول العالم
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {partners.map((p) =>
            p.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.id}
                src={p.logo_url}
                alt={p.name}
                className="h-7 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0"
              />
            ) : (
              <span
                key={p.id}
                className="text-lg font-semibold text-slate-500 transition hover:text-slate-300"
              >
                {p.name}
              </span>
            )
          )}
        </div>
      </Container>
    </section>
  );
}
