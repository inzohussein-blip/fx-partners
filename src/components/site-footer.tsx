import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-ink-900">
      <Container className="grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            منصة الشراكة المالية التي تربط الوكلاء والمسوّقين بأفضل شركات التداول
            العالمية، بأعلى نسب عمولة وشفافية كاملة في الأرباح.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">الشراكة</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link href="/affiliates" className="hover:text-white">برنامج الوكلاء</Link></li>
            <li><Link href="/brokers" className="hover:text-white">تعاون الشركات</Link></li>
            <li><Link href="/blog" className="hover:text-white">المدونة</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">الحساب</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link href="/login" className="hover:text-white">تسجيل الدخول</Link></li>
            <li><Link href="/dashboard" className="hover:text-white">لوحة التحكم</Link></li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/5 py-6">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} FX Partners. جميع الحقوق محفوظة.</p>
          <p className="max-w-xl text-center sm:text-right">
            تحذير المخاطر: التداول في العملات والمشتقات ينطوي على مخاطر عالية.
          </p>
        </Container>
      </div>
    </footer>
  );
}
