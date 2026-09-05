import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/logo";
import { Check } from "lucide-react";

const BENEFITS = [
  "عمولات حتى 60% وترقية تلقائية للمستوى",
  "أدوات تسويق احترافية وروابط متتبَّعة",
  "سحوبات سريعة خلال 24 ساعة",
  "لوحة تحكم عربية بالكامل ودعم مخصّص",
];

/**
 * Shared shell for every auth screen (login / sign-up / forgot / reset):
 * a two-column layout with a brand benefits panel on the left (desktop) and
 * the form card on the right. On mobile it collapses to just the card with a
 * centered logo above it.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="hero-glow flex min-h-screen items-center justify-center py-12">
      <Container className="grid max-w-4xl items-center gap-12 lg:grid-cols-2">
        {/* Brand / benefits panel */}
        <div className="hidden lg:block">
          <Link href="/">
            <Logo markClassName="h-9 w-9" />
          </Link>
          <h2 className="mt-8 text-3xl font-extrabold leading-tight text-white">
            انضم لأكبر شبكة شراكة تداول في الوطن العربي
          </h2>
          <ul className="mt-8 space-y-4">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3 text-slate-300">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-500/20 text-brand-300">
                  <Check className="h-3 w-3" />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Form card */}
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-6 flex justify-center lg:hidden">
            <Logo markClassName="h-9 w-9" />
          </Link>
          <div className="card-surface p-8">{children}</div>
        </div>
      </Container>
    </div>
  );
}
