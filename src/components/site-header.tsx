import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/", label: "الرئيسية" },
  { href: "/affiliates", label: "الوكلاء / IB" },
  { href: "/brokers", label: "الشركات (B2B)" },
  { href: "/blog", label: "المدونة" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-900/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 font-bold text-white">
            FX
          </span>
          <span className="text-lg font-bold text-white">Partners</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button href="/login" variant="ghost" className="hidden sm:inline-flex">
            تسجيل الدخول
          </Button>
          <Button href="/login">لوحة الشريك</Button>
        </div>
      </Container>
    </header>
  );
}
