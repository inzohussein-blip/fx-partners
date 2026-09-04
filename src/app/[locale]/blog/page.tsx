import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Newspaper } from "lucide-react";

export const metadata: Metadata = {
  title: "المدونة",
  description: "أخبار ومقالات FX Partners حول التداول والشراكة المالية.",
};

export const revalidate = 60;

type Post = {
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
};

async function getPosts(): Promise<Post[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("posts")
      .select("slug,title,excerpt,published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Intl.DateTimeFormat("ar", { dateStyle: "long" }).format(new Date(iso));
}

export default async function BlogPage() {
  const posts = await getPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <SiteHeader />
      <section className="hero-glow">
        <Container className="py-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            <Newspaper className="h-3.5 w-3.5" />
            المدونة
          </span>
          <h1 className="mt-5 text-4xl font-extrabold text-white sm:text-5xl">
            رؤى وأخبار التداول
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            مقالات وتحليلات حول التداول وبرامج الشراكة المالية.
          </p>
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          {posts.length === 0 ? (
            <div className="card-surface p-12 text-center text-sm text-slate-500">
              لا توجد منشورات منشورة بعد.
            </div>
          ) : (
            <div className="space-y-10">
              {/* Featured latest post */}
              <Link
                href={`/blog/${featured.slug}`}
                className="card-surface group relative block overflow-hidden p-8 transition hover:ring-1 hover:ring-brand-500/30 sm:p-10"
              >
                <div className="hero-glow absolute inset-0 opacity-50" />
                <div className="relative max-w-2xl">
                  <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/15 px-3 py-1 text-xs font-medium text-brand-200">
                    الأحدث
                  </span>
                  {featured.published_at && (
                    <time className="ms-3 text-xs text-slate-500">
                      {fmtDate(featured.published_at)}
                    </time>
                  )}
                  <h2 className="mt-4 text-2xl font-bold text-white group-hover:text-brand-100 sm:text-3xl">
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p className="mt-3 text-slate-300">{featured.excerpt}</p>
                  )}
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-300 transition group-hover:gap-2">
                    اقرأ المقال
                    <ArrowLeft className="h-4 w-4" />
                  </span>
                </div>
              </Link>

              {/* Rest */}
              {rest.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="card-surface group flex flex-col p-6 transition hover:ring-1 hover:ring-brand-500/30"
                    >
                      {post.published_at && (
                        <time className="text-xs text-slate-500">
                          {fmtDate(post.published_at)}
                        </time>
                      )}
                      <h3 className="mt-2 text-lg font-semibold text-white group-hover:text-brand-200">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                          {post.excerpt}
                        </p>
                      )}
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-300 transition group-hover:gap-2">
                        اقرأ المزيد
                        <ArrowLeft className="h-4 w-4" />
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
