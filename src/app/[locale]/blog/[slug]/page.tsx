import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const revalidate = 60;

type Post = {
  title: string;
  body: string | null;
  excerpt: string | null;
  published_at: string | null;
};

async function getPost(slug: string): Promise<Post | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("posts")
      .select("title,body,excerpt,published_at")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "منشور غير موجود | FX Partners" };

  const title = post.title;
  const description = post.excerpt ?? undefined;
  const url = `${getSiteUrl()}/blog/${params.slug}`;
  const ogImage = `${getSiteUrl()}/api/banner?size=wide`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      publishedTime: post.published_at ?? undefined,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.published_at ?? undefined,
    author: { "@type": "Organization", name: "FX Partners" },
    publisher: { "@type": "Organization", name: "FX Partners" },
    mainEntityOfPage: `${getSiteUrl()}/blog/${params.slug}`,
  };

  return (
    <>
      <SiteHeader />
      <article className="py-16">
        <Container className="max-w-3xl">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          <Breadcrumbs
            items={[
              { label: "المدونة", href: "/blog" },
              { label: post.title },
            ]}
          />

          <h1 className="mt-6 text-3xl font-extrabold text-white sm:text-4xl">
            {post.title}
          </h1>
          {post.published_at && (
            <time className="mt-3 block text-sm text-slate-500">
              {new Intl.DateTimeFormat("ar", { dateStyle: "long" }).format(
                new Date(post.published_at)
              )}
            </time>
          )}

          <div className="prose prose-invert mt-8 max-w-none whitespace-pre-wrap text-slate-300">
            {post.body}
          </div>

          <div className="mt-12 border-t border-white/5 pt-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-sm text-brand-300 hover:text-brand-200"
            >
              <ArrowRight className="h-4 w-4" />
              العودة إلى المدونة
            </Link>
          </div>
        </Container>
      </article>
      <SiteFooter />
    </>
  );
}
