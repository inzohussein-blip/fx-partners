import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  primary:
    "btn-gradient text-white shadow-glow focus-visible:ring-brand-300",
  secondary:
    "bg-fg/5 hover:bg-fg/10 text-fg border border-fg/10 focus-visible:ring-fg/30",
  ghost: "text-slate-300 hover:text-fg hover:bg-fg/5 focus-visible:ring-fg/20",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:opacity-50";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  href?: string;
}

export function Button({
  variant = "primary",
  href,
  className,
  children,
  ...props
}: Props) {
  const classes = cn(base, styles[variant], className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
