import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Avatar, formatForumDate } from "@/components/forum/avatar";
import { LikeButton } from "@/components/forum/like-button";
import { Comments } from "@/components/forum/comments";
import { ViewPing } from "@/components/forum/view-ping";
import { getPost, getComments, getReactionState } from "@/lib/forum";
import { createClient } from "@/lib/supabase/server";
import { BadgeCheck, Eye, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

function isHtml(body: string | null | undefined): boolean {
  return !!body && /<([a-z][a-z0-9]*)\b[^>]*>/i.test(body);
}

export async function generateMetadata({
  params,
}: {
  params: { channel: string; slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.channel, params.slug);
  if (!post) return { title: "منشور غير موجود" };
  return {
    title: `${post.title} — منتدى FX Partners`,
    description: post.excerpt ?? undefined,
  };
}

export default async function ForumPostPage({
  params,
}: {
  params: { channel: string; slug: string };
}) {
  const post = await getPost(params.channel, params.slug);
  if (!post || post.channel?.status !== "active") notFound();

  const [comments, reaction] = await Promise.all([
    getComments(post.id),
    getReactionState(post.id),
  ]);

  // Current user / role (for comment ownership + moderation + like gating).
  let currentUserId: string | null = null;
  let isAdmin = false;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      currentUserId = user.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      isAdmin = profile?.role === "admin";
    }
  } catch {
    /* ignore */
  }
  const isAuthed = !!currentUserId;

  return (
    <>
      <SiteHeader />
      <ViewPing postId={post.id} />
      <article className="pb-24">
        <Container className="max-w-3xl pt-10">
          <Breadcrumbs
            items={[
              { label: "المنتدى", href: "/forum" },
              { label: post.channel?.name ?? "قناة", href: `/forum/${params.channel}` },
              { label: post.title },
            ]}
          />

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Avatar name={post.author_name} src={post.author_avatar} size={32} />
              <span className="font-medium text-slate-200">{post.author_name || "عضو"}</span>
            </div>
            <span>·</span>
            <Link
              href={`/forum/${params.channel}`}
              className="inline-flex items-center gap-1 text-brand-300 hover:text-brand-200"
            >
              {post.channel?.kind === "official" && <BadgeCheck className="h-4 w-4" />}
              {post.channel?.name}
            </Link>
            <span>·</span>
            <time>{formatForumDate(post.created_at)}</time>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-4 w-4" /> {post.views}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            {post.title}
          </h1>

          {post.cover_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.cover_image}
              alt=""
              className="mt-6 w-full rounded-2xl border border-white/10 object-cover"
            />
          )}

          {isHtml(post.body) ? (
            <div
              className="prose prose-invert mt-8 max-w-none text-slate-300 prose-headings:text-white prose-a:text-brand-300 prose-strong:text-white"
              dangerouslySetInnerHTML={{ __html: post.body ?? "" }}
            />
          ) : (
            <div className="prose prose-invert mt-8 max-w-none whitespace-pre-wrap text-slate-300">
              {post.body ?? ""}
            </div>
          )}

          <div className="mt-8 flex items-center gap-3 border-y border-white/5 py-4">
            <LikeButton
              postId={post.id}
              initialLiked={reaction.liked}
              initialCount={reaction.total}
              isAuthed={isAuthed}
            />
            <Link
              href="#comments"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
            >
              {post.comment_count ?? comments.filter((c) => !c.is_hidden).length} تعليق
            </Link>
          </div>

          <Comments
            postId={post.id}
            comments={comments}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            isAuthed={isAuthed}
          />

          <div className="mt-12 border-t border-white/5 pt-6">
            <Link
              href={`/forum/${params.channel}`}
              className="inline-flex items-center gap-1 text-sm text-brand-300 hover:text-brand-200"
            >
              <ArrowRight className="h-4 w-4" />
              العودة إلى القناة
            </Link>
          </div>
        </Container>
      </article>
      <SiteFooter />
    </>
  );
}
