import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { createClient } from "@/lib/supabase/server";
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
}) {
  const post = await getPost(params.slug);
  return {
    title: post?.title ?? "منشور",
    description: post?.excerpt ?? undefined,
  };
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <>
      <SiteHeader />
      <article className="py-16">
        <Container className="max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
          >
            <ArrowRight className="h-4 w-4" />
            العودة إلى المدونة
          </Link>

          <h1 className="mt-6 text-3xl font-extrabold text-white sm:text-4xl">
            {post.title}
          </h1>
          {post.published_at && (
            <time className="mt-3 block text-sm text-slate-500">
              {new Date(post.published_at).toLocaleDateString("ar")}
            </time>
          )}

          <div className="prose prose-invert mt-8 max-w-none whitespace-pre-wrap text-slate-300">
            {post.body}
          </div>
        </Container>
      </article>
      <SiteFooter />
    </>
  );
}
