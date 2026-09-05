"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult<T = undefined> = { ok: boolean; error?: string; data?: T };

function slugify(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[\s؀-ۿ]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || `c-${Date.now().toString(36)}`;
}

/** Resolve the signed-in user + their profile (for denormalized author fields). */
async function currentAuthor() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();
  return { supabase, user, profile };
}

function revalidateForum(channelSlug?: string, postSlug?: string) {
  revalidatePath("/forum");
  revalidatePath("/dashboard/forum");
  revalidatePath("/dashboard/admin/forum");
  if (channelSlug) {
    revalidatePath(`/forum/${channelSlug}`);
    if (postSlug) revalidatePath(`/forum/${channelSlug}/${postSlug}`);
  }
}

// ---- CHANNELS -------------------------------------------------------------

export type ChannelInput = {
  id?: string;
  name: string;
  description?: string;
  cover_image?: string;
};

/** Create a channel. Agents (IB) get a pending 'agent' channel; admins get an active one. */
export async function createChannel(input: ChannelInput): Promise<ActionResult<{ slug: string }>> {
  const { supabase, user, profile } = await currentAuthor();
  if (!user) return { ok: false, error: "يجب تسجيل الدخول" };
  if (!profile || !["ib", "admin"].includes(profile.role)) {
    return { ok: false, error: "متاح للوكلاء المعتمدين فقط" };
  }
  const name = input.name?.trim();
  if (!name) return { ok: false, error: "اسم القناة مطلوب" };

  const isAdmin = profile.role === "admin";
  const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;

  const { error } = await supabase.from("forum_channels").insert({
    slug,
    name,
    description: input.description?.trim() || null,
    cover_image: input.cover_image?.trim() || null,
    owner_id: user.id,
    owner_name: profile.full_name || null,
    kind: isAdmin ? "official" : "agent",
    status: isAdmin ? "active" : "pending",
  });
  if (error) return { ok: false, error: error.message };

  revalidateForum(slug);
  return { ok: true, data: { slug } };
}

/** Update a channel's editable fields (owner or admin). */
export async function updateChannel(input: ChannelInput): Promise<ActionResult> {
  const { supabase, user } = await currentAuthor();
  if (!user || !input.id) return { ok: false, error: "غير مصرّح" };

  const { error } = await supabase
    .from("forum_channels")
    .update({
      name: input.name?.trim(),
      description: input.description?.trim() || null,
      cover_image: input.cover_image?.trim() || null,
    })
    .eq("id", input.id);
  if (error) return { ok: false, error: error.message };

  revalidateForum();
  return { ok: true };
}

/** Admin-only: approve / ban / re-pend a channel. */
export async function setChannelStatus(
  id: string,
  status: "active" | "pending" | "banned"
): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from("forum_channels")
    .update({ status })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateForum();
  return { ok: true };
}

export async function deleteChannel(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from("forum_channels").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateForum();
  return { ok: true };
}

// ---- POSTS ----------------------------------------------------------------

export type ForumPostInput = {
  id?: string;
  channel_id: string;
  title: string;
  excerpt?: string;
  body?: string;
  cover_image?: string;
  status?: "published" | "draft";
  is_pinned?: boolean;
};

export async function saveForumPost(input: ForumPostInput): Promise<ActionResult<{ slug: string }>> {
  const { supabase, user, profile } = await currentAuthor();
  if (!user) return { ok: false, error: "يجب تسجيل الدخول" };
  const title = input.title?.trim();
  if (!title) return { ok: false, error: "العنوان مطلوب" };
  if (!input.channel_id) return { ok: false, error: "القناة مطلوبة" };

  const base = {
    title,
    excerpt: input.excerpt?.trim() || null,
    body: input.body ?? null,
    cover_image: input.cover_image?.trim() || null,
    status: input.status ?? "published",
    is_pinned: input.is_pinned ?? false,
  };

  if (input.id) {
    const { error } = await supabase.from("forum_posts").update(base).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    revalidateForum();
    return { ok: true };
  }

  const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`;
  const { error } = await supabase.from("forum_posts").insert({
    ...base,
    slug,
    channel_id: input.channel_id,
    author_id: user.id,
    author_name: profile?.full_name || null,
    author_avatar: profile?.avatar_url || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidateForum();
  return { ok: true, data: { slug } };
}

export async function deleteForumPost(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from("forum_posts").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateForum();
  return { ok: true };
}

// ---- COMMENTS -------------------------------------------------------------

export async function addComment(
  postId: string,
  body: string,
  parentId?: string | null
): Promise<ActionResult> {
  const { supabase, user, profile } = await currentAuthor();
  if (!user) return { ok: false, error: "يجب تسجيل الدخول للتعليق" };
  const text = body?.trim();
  if (!text) return { ok: false, error: "التعليق فارغ" };
  if (text.length > 4000) return { ok: false, error: "التعليق طويل جداً" };

  const { error } = await supabase.from("forum_comments").insert({
    post_id: postId,
    parent_id: parentId || null,
    author_id: user.id,
    author_name: profile?.full_name || "عضو",
    author_avatar: profile?.avatar_url || null,
    body: text,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/forum", "layout");
  return { ok: true };
}

export async function deleteComment(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from("forum_comments").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/forum", "layout");
  revalidatePath("/dashboard/admin/forum");
  return { ok: true };
}

/** Admin-only: hide / unhide an abusive comment. */
export async function hideComment(id: string, hidden: boolean): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from("forum_comments")
    .update({ is_hidden: hidden })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/forum", "layout");
  revalidatePath("/dashboard/admin/forum");
  return { ok: true };
}

// ---- REACTIONS ------------------------------------------------------------

/** Toggle the current user's like on a post. Returns the new liked state. */
export async function togglePostReaction(postId: string): Promise<ActionResult<{ liked: boolean }>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "يجب تسجيل الدخول" };

  const { data: existing } = await supabase
    .from("forum_reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("forum_reactions").delete().eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/forum", "layout");
    return { ok: true, data: { liked: false } };
  }

  const { error } = await supabase
    .from("forum_reactions")
    .insert({ post_id: postId, user_id: user.id });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/forum", "layout");
  return { ok: true, data: { liked: true } };
}

/** Fire-and-forget view counter (RPC is atomic). */
export async function incrementForumViews(postId: string): Promise<void> {
  const supabase = createClient();
  await supabase.rpc("forum_increment_views", { p_post: postId });
}
