import { createClient } from "@/lib/supabase/server";

export type Channel = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  owner_id: string;
  owner_name: string | null;
  kind: "official" | "agent";
  status: "active" | "pending" | "banned";
  created_at: string;
  post_count?: number;
};

export type ForumPost = {
  id: string;
  channel_id: string;
  author_id: string;
  author_name: string | null;
  author_avatar: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  cover_image: string | null;
  status: "published" | "draft";
  is_pinned: boolean;
  views: number;
  created_at: string;
  channel?: { slug: string; name: string; kind: string; status: string } | null;
  comment_count?: number;
  reaction_count?: number;
};

export type ForumComment = {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_id: string;
  author_name: string | null;
  author_avatar: string | null;
  body: string;
  is_hidden: boolean;
  created_at: string;
};

const enabled = () => !!process.env.NEXT_PUBLIC_SUPABASE_URL;

function count(rel: unknown): number {
  if (Array.isArray(rel)) return (rel[0] as { count?: number })?.count ?? 0;
  return 0;
}

/** Active channels for the public hub, split into official + agent. */
export async function getChannels(): Promise<Channel[]> {
  if (!enabled()) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("forum_channels")
      .select("*, forum_posts(count)")
      .eq("status", "active")
      .order("kind", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    return (data ?? []).map((c) => ({
      ...(c as unknown as Channel),
      post_count: count((c as Record<string, unknown>).forum_posts),
    }));
  } catch {
    return [];
  }
}

export async function getChannel(slug: string): Promise<Channel | null> {
  if (!enabled()) return null;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("forum_channels")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return (data as unknown as Channel) ?? null;
  } catch {
    return null;
  }
}

/** Posts inside one channel (published; RLS also shows the owner's drafts). */
export async function getChannelPosts(channelId: string): Promise<ForumPost[]> {
  if (!enabled()) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("forum_posts")
      .select("*, forum_comments(count), forum_reactions(count)")
      .eq("channel_id", channelId)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });
    return (data ?? []).map(mapPost);
  } catch {
    return [];
  }
}

/** Posts for a set of channels (dashboard management), grouped by channel id. */
export async function getPostsForChannels(
  channelIds: string[]
): Promise<Record<string, ForumPost[]>> {
  const grouped: Record<string, ForumPost[]> = {};
  if (!enabled() || channelIds.length === 0) return grouped;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("forum_posts")
      .select("*, forum_comments(count), forum_reactions(count)")
      .in("channel_id", channelIds)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });
    for (const row of data ?? []) {
      const p = mapPost(row);
      (grouped[p.channel_id] ??= []).push(p);
    }
    return grouped;
  } catch {
    return grouped;
  }
}

/** Cross-channel latest published posts for the hub feed. */
export async function getLatestPosts(limit = 12): Promise<ForumPost[]> {
  if (!enabled()) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("forum_posts")
      .select(
        "*, forum_comments(count), forum_reactions(count), channel:forum_channels!inner(slug,name,kind,status)"
      )
      .eq("status", "published")
      .eq("forum_channels.status", "active")
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data ?? []).map(mapPost);
  } catch {
    return [];
  }
}

export async function getPost(
  channelSlug: string,
  postSlug: string
): Promise<ForumPost | null> {
  if (!enabled()) return null;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("forum_posts")
      .select(
        "*, forum_comments(count), forum_reactions(count), channel:forum_channels!inner(slug,name,kind,status)"
      )
      .eq("slug", postSlug)
      .eq("forum_channels.slug", channelSlug)
      .maybeSingle();
    return data ? mapPost(data) : null;
  } catch {
    return null;
  }
}

export async function getComments(postId: string): Promise<ForumComment[]> {
  if (!enabled()) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("forum_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    return (data ?? []) as unknown as ForumComment[];
  } catch {
    return [];
  }
}

/** Channels owned by a user (for the dashboard), any status. */
export async function getMyChannels(userId: string): Promise<Channel[]> {
  if (!enabled()) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("forum_channels")
      .select("*, forum_posts(count)")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });
    return (data ?? []).map((c) => ({
      ...(c as unknown as Channel),
      post_count: count((c as Record<string, unknown>).forum_posts),
    }));
  } catch {
    return [];
  }
}

/** All channels for admin moderation. */
export async function getAllChannels(): Promise<Channel[]> {
  if (!enabled()) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("forum_channels")
      .select("*, forum_posts(count)")
      .order("created_at", { ascending: false });
    return (data ?? []).map((c) => ({
      ...(c as unknown as Channel),
      post_count: count((c as Record<string, unknown>).forum_posts),
    }));
  } catch {
    return [];
  }
}

export type AdminComment = ForumComment & {
  post?: { title: string; slug: string; channel?: { slug: string } | null } | null;
};

/** Recent comments across all posts, for admin moderation (includes hidden). */
export async function getRecentComments(limit = 50): Promise<AdminComment[]> {
  if (!enabled()) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("forum_comments")
      .select("*, post:forum_posts(title,slug,channel:forum_channels(slug))")
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data ?? []) as unknown as AdminComment[];
  } catch {
    return [];
  }
}

/** Whether the current user has liked a post + the total count. */
export async function getReactionState(
  postId: string
): Promise<{ liked: boolean; total: number }> {
  if (!enabled()) return { liked: false, total: 0 };
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const [{ count: total }, mine] = await Promise.all([
      supabase
        .from("forum_reactions")
        .select("id", { count: "exact", head: true })
        .eq("post_id", postId),
      user
        ? supabase
            .from("forum_reactions")
            .select("id")
            .eq("post_id", postId)
            .eq("user_id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    return { liked: !!(mine as { data: unknown }).data, total: total ?? 0 };
  } catch {
    return { liked: false, total: 0 };
  }
}

function mapPost(row: unknown): ForumPost {
  const r = row as Record<string, unknown>;
  return {
    ...(r as unknown as ForumPost),
    comment_count: count(r.forum_comments),
    reaction_count: count(r.forum_reactions),
    channel: (r.channel as ForumPost["channel"]) ?? null,
  };
}
