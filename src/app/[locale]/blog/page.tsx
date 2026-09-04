import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { createClient } from "@/lib/supabase/server";

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

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <SiteHeader />
      <section className="hero-glow">
        <Container className="py-16 text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">المدونة</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            رؤى ومقالات حول التداول وبرامج الشراكة المالية.
          </p>
        </Container>
      </section>

      <section className="pb-20">
        <Container>
          {posts.length === 0 ? (
            <p className="text-center text-sm text-slate-500">
              لا توجد منشورات منشورة بعد. أضِف منشورات من جدول <code>posts</code>.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="card-surface group p-6 transition hover:border-brand-500/30"
                >
                  {post.published_at && (
                    <time className="text-xs text-slate-500">
                      {new Date(post.published_at).toLocaleDateString("ar")}
                    </time>
                  )}
                  <h2 className="mt-2 text-lg font-semibold text-white group-hover:text-brand-200">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 text-sm text-slate-400">{post.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
