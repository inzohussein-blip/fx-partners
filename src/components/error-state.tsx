import { Link } from "@/i18n/navigation";
import { Logo, LogoMark } from "@/components/logo";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

export function ErrorState({
  code,
  title,
  message,
  action,
  links,
}: {
  code: string;
  title: string;
  message: string;
  /** Optional custom action(s); defaults to a "back home" button. */
  action?: React.ReactNode;
  /** Optional quick links rendered as cards below the message. */
  links?: { href: string; label: string; icon: LucideIcon }[];
}) {
  return (
    <div className="hero-glow relative flex min-h-screen items-center justify-center overflow-hidden py-16">
      {/* Decorative faint emblem */}
      <LogoMark
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-[0.04] blur-sm"
      />

      <Container className="relative max-w-lg text-center">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo markClassName="h-9 w-9" />
        </Link>
        <div dir="ltr" className="text-gradient text-7xl font-extrabold sm:text-8xl">
          {code}
        </div>
        <h1 className="mt-4 text-2xl font-bold text-white">{title}</h1>
        <p className="mt-3 text-slate-400">{message}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {action ?? <Button href="/">العودة للرئيسية</Button>}
        </div>

        {links && links.length > 0 && (
          <div className="mt-10">
            <p className="text-xs text-slate-500">أو انتقل مباشرة إلى:</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="card-surface group flex flex-col items-center gap-2 p-4 transition hover:ring-1 hover:ring-brand-500/30"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20 transition group-hover:bg-brand-500/20">
                    <l.icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-medium text-slate-300">{l.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
