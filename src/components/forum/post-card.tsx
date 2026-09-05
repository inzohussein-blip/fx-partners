import { Link } from "@/i18n/navigation";
import { Heart, MessageCircle, Eye, Pin, BadgeCheck } from "lucide-react";
import type { ForumPost } from "@/lib/forum";
import { Avatar, formatForumDate } from "@/components/forum/avatar";

/**
 * Feed card for a forum post. Pass channelSlug when the row doesn't embed its
 * channel (e.g. inside a single channel page).
 */
export function PostCard({
  post,
  channelSlug,
}: {
  post: ForumPost;
  channelSlug?: string;
}) {
  const cSlug = post.channel?.slug ?? channelSlug ?? "";
  const href = `/forum/${cSlug}/${post.slug}`;

  return (
    <article className="card-surface group overflow-hidden transition hover:border-brand-500/40">
      {post.cover_image && (
        <Link href={href} className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover_image}
            alt=""
            className="h-40 w-full object-cover"
            loading="lazy"
          />
        </Link>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Avatar name={post.author_name} src={post.author_avatar} size={26} />
          <span className="font-medium text-slate-300">{post.author_name || "عضو"}</span>
          {post.channel && (
            <>
              <span className="text-slate-600">·</span>
              <Link
                href={`/forum/${post.channel.slug}`}
                className="inline-flex items-center gap-1 text-brand-300 hover:text-brand-200"
              >
                {post.channel.kind === "official" && <BadgeCheck className="h-3.5 w-3.5" />}
                {post.channel.name}
              </Link>
            </>
          )}
          <span className="text-slate-600">·</span>
          <time>{formatForumDate(post.created_at)}</time>
          {post.is_pinned && <Pin className="h-3.5 w-3.5 text-gold-400" aria-label="مثبّت" />}
        </div>

        <Link href={href}>
          <h3 className="mt-3 text-lg font-bold leading-snug text-white group-hover:text-brand-200">
            {post.title}
          </h3>
        </Link>
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">
            {post.excerpt}
          </p>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" /> {post.reaction_count ?? 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" /> {post.comment_count ?? 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" /> {post.views ?? 0}
          </span>
          {post.status === "draft" && (
            <span className="rounded bg-gold-500/10 px-2 py-0.5 text-gold-400">مسودة</span>
          )}
        </div>
      </div>
    </article>
  );
}
