import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import {
  bannerExpired,
  pickText,
  type BannerConfig,
  type CardsConfig,
  type CtaConfig,
  type SectionIcon,
  type TextConfig,
} from "@/lib/page-sections";
import {
  ArrowLeft, Bell, BookOpen, CalendarDays, Gift, Globe, Handshake, LineChart, Scale,
  ShieldCheck, Sparkles, Star, Target, Trophy, Users, Wallet, Zap, type LucideIcon,
} from "lucide-react";

/*
 * The blocks an admin can add to any page from /dashboard/admin/pages. All
 * text is rendered as text (never HTML), links are limited to site paths and
 * https URLs by the schema, and a block with nothing to show in the current
 * language renders nothing rather than an empty frame.
 */

const ICONS: Record<SectionIcon, LucideIcon> = {
  shield: ShieldCheck, trophy: Trophy, chart: LineChart, users: Users, handshake: Handshake,
  gift: Gift, zap: Zap, star: Star, globe: Globe, wallet: Wallet, book: BookOpen,
  calendar: CalendarDays, bell: Bell, scale: Scale, target: Target, sparkles: Sparkles,
};

const TONES = {
  brand: "bg-brand-500/10 text-brand-300 ring-brand-500/20",
  accent: "bg-accent-500/10 text-accent-300 ring-accent-500/20",
  amber: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
  emerald: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
} as const;

/** Site path → locale-aware Link; https URL → a new tab. */
function SmartLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  if (href.startsWith("/")) return <Link href={href} className={className}>{children}</Link>;
  return (
    <a href={href} target="_blank" rel="noopener nofollow" className={className}>
      {children}
    </a>
  );
}

function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  if (!title && !subtitle) return null;
  return (
    <div className="mx-auto max-w-2xl text-center">
      {title && <h2 className="text-2xl font-bold text-fg sm:text-3xl">{title}</h2>}
      {subtitle && <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-400">{subtitle}</p>}
    </div>
  );
}

export function CardsSection({ config, locale }: { config: CardsConfig; locale: string }) {
  const items = config.items
    .map((i) => ({ ...i, t: pickText(i.title, locale), b: pickText(i.body, locale) }))
    .filter((i) => i.t);
  if (items.length === 0) return null;
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[config.columns];

  return (
    <section className="py-14 sm:py-16">
      <Container>
        <Heading title={pickText(config.title, locale)} subtitle={pickText(config.subtitle, locale)} />
        <div className={cn("mt-10 grid gap-4", cols)}>
          {items.map((i, n) => {
            const Icon = ICONS[i.icon];
            const body = (
              <>
                <span className={cn("grid h-11 w-11 place-items-center rounded-xl ring-1", TONES[i.tone])}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-bold text-fg">{i.t}</h3>
                {i.b && <p className="mt-2 flex-1 whitespace-pre-line text-sm leading-relaxed text-slate-400">{i.b}</p>}
                {i.href && (
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300">
                    {locale === "ar" ? "اعرف المزيد" : "Learn more"}
                    <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden />
                  </span>
                )}
              </>
            );
            const cls = "card-surface flex h-full flex-col p-6 transition";
            return i.href ? (
              <SmartLink key={n} href={i.href} className={cn(cls, "hover:border-brand-400/40")}>{body}</SmartLink>
            ) : (
              <div key={n} className={cls}>{body}</div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export function CtaSection({ config, locale }: { config: CtaConfig; locale: string }) {
  const title = pickText(config.title, locale);
  if (!title) return null;
  const buttons = [config.primary, config.secondary]
    .map((l, n) => ({ label: pickText(l.label, locale), href: l.href, primary: n === 0 }))
    .filter((b) => b.label && b.href);

  return (
    <section className="py-14">
      <Container>
        <div className="card-surface relative overflow-hidden p-8 text-center sm:p-12">
          <div className="hero-glow absolute inset-0 -z-10 opacity-60" aria-hidden />
          <h2 className="text-2xl font-bold text-fg sm:text-3xl">{title}</h2>
          {pickText(config.body, locale) && (
            <p className="mx-auto mt-3 max-w-xl whitespace-pre-line text-slate-300">{pickText(config.body, locale)}</p>
          )}
          {buttons.length > 0 && (
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {buttons.map((b) => (
                <SmartLink
                  key={b.href + b.label}
                  href={b.href}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition",
                    b.primary ? "btn-gradient text-white shadow-glow" : "border border-fg/10 bg-fg/5 text-fg hover:bg-fg/10"
                  )}
                >
                  {b.label}
                </SmartLink>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

export function BannerSection({ config, locale }: { config: BannerConfig; locale: string }) {
  const text = pickText(config.text, locale);
  if (!text || bannerExpired(config)) return null;
  const label = pickText(config.link.label, locale);

  return (
    <section className="py-4">
      <Container>
        <div className={cn("flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-2xl px-5 py-4 text-center text-sm ring-1", TONES[config.tone])}>
          <Bell className="h-4 w-4 shrink-0" aria-hidden />
          <span className="whitespace-pre-line font-medium text-fg">{text}</span>
          {label && config.link.href && (
            <SmartLink href={config.link.href} className="font-semibold underline underline-offset-4">
              {label}
            </SmartLink>
          )}
        </div>
      </Container>
    </section>
  );
}

export function TextSection({ config, locale }: { config: TextConfig; locale: string }) {
  const title = pickText(config.title, locale);
  const body = pickText(config.body, locale);
  if (!title && !body) return null;
  return (
    <section className="py-12">
      <Container className="max-w-3xl">
        {title && <h2 className="text-2xl font-bold text-fg">{title}</h2>}
        {body && (
          <div className="mt-4 space-y-4 leading-loose text-slate-300">
            {body.split(/\n{2,}/).map((p, n) => (
              <p key={n} className="whitespace-pre-line">{p}</p>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
