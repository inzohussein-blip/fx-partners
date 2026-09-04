import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "خريطة الموقع",
  description: "دليل كامل بكل صفحات وأقسام FX Partners.",
};

async function getLists() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { brokers: [], posts: [] };
  try {
    const supabase = createClient();
    const [{ data: brokers }, { data: posts }] = await Promise.all([
      supabase
        .from("brokers")
        .select("slug,name")
        .eq("is_published", true)
        .order("sort_order"),
      supabase
        .from("posts")
        .select("slug,title")
        .eq("status", "published")
        .order("published_at", { ascending: false }),
    ]);
    return {
      brokers: (brokers as { slug: string; name: string }[]) ?? [],
      posts: (posts as { slug: string; title: string }[]) ?? [],
    };
  } catch {
    return { brokers: [], posts: [] };
  }
}

const SECTIONS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "الرئيسية",
    links: [
      { href: "/", label: "الصفحة الرئيسية" },
      { href: "/affiliates", label: "برنامج الوكلاء" },
      { href: "/brokers", label: "تعاون الشركات (B2B)" },
    ],
  },
  {
    title: "الأدوات والمقارنات",
    links: [
      { href: "/compare", label: "قارن الشركات" },
      { href: "/tools", label: "حاسبات الفوركس" },
      { href: "/offers", label: "القنّاص المالي — العروض" },
    ],
  },
  {
    title: "المحتوى والحساب",
    links: [
      { href: "/blog", label: "المدونة" },
      { href: "/login", label: "تسجيل الدخول / إنشاء حساب" },
      { href: "/dashboard", label: "لوحة الشريك" },
    ],
  },
];

export default async function SiteMapPage() {
  const { brokers, posts } = await getLists();

  return (
    <>
      <SiteHeader />
      <section className="py-14">
        <Container>
          <Breadcrumbs items={[{ label: "خريطة الموقع" }]} />
          <h1 className="mt-6 text-3xl font-extrabold text-white sm:text-4xl">
            خريطة الموقع
          </h1>
          <p className="mt-3 text-slate-400">دليل كامل بكل صفحات وأقسام المنصّة.</p>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {SECTIONS.map((s) => (
              <div key={s.title} className="card-surface p-6">
                <h2 className="text-sm font-semibold text-brand-200">{s.title}</h2>
                <ul className="mt-4 space-y-2 text-sm">
                  {s.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-slate-300 hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {brokers.length > 0 && (
              <div className="card-surface p-6">
                <h2 className="text-sm font-semibold text-brand-200">
                  الشركات ({brokers.length})
                </h2>
                <ul className="mt-4 space-y-2 text-sm">
                  {brokers.map((b) => (
                    <li key={b.slug}>
                      <Link
                        href={`/brokers/${b.slug}`}
                        className="text-slate-300 hover:text-white"
                      >
                        {b.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {posts.length > 0 && (
              <div className="card-surface p-6 md:col-span-2">
                <h2 className="text-sm font-semibold text-brand-200">
                  المقالات ({posts.length})
                </h2>
                <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  {posts.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/blog/${p.slug}`}
                        className="text-slate-300 hover:text-white"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
