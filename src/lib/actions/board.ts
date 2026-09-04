"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendTelegram } from "@/lib/telegram";
import { getSiteUrl } from "@/lib/utils";

type ActionResult = { ok: boolean; error?: string };

async function currentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";
  }
  return { supabase, user, isAdmin };
}

const postSchema = z.object({
  brokerId: z.string().uuid(),
  parentId: z.string().uuid().optional().nullable(),
  authorName: z.string().trim().min(2, "الاسم مطلوب").max(60),
  body: z.string().trim().min(2, "الرسالة قصيرة جداً").max(2000),
});

/** Public: create a thread (parentId null) or a reply. Admins post as staff. */
export async function createBoardPost(input: unknown): Promise<ActionResult> {
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "بيانات غير صالحة" };
  }
  const d = parsed.data;
  const { supabase, user, isAdmin } = await currentUser();

  const { error } = await supabase.from("broker_posts").insert({
    broker_id: d.brokerId,
    parent_id: d.parentId ?? null,
    user_id: user?.id ?? null,
    author_name: isAdmin ? d.authorName || "إدارة FX Partners" : d.authorName,
    body: d.body,
    is_staff: isAdmin,
  });
  if (error) return { ok: false, error: error.message };

  // Notify the site owner of new top-level questions (best-effort).
  const adminChat = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (adminChat && !isAdmin && !d.parentId) {
    const { data: broker } = await supabase
      .from("brokers")
      .select("name,slug")
      .eq("id", d.brokerId)
      .maybeSingle();
    const excerpt = d.body.length > 160 ? d.body.slice(0, 160) + "…" : d.body;
    await sendTelegram(
      adminChat,
      `💬 <b>نقاش جديد في المنتدى</b>\n` +
        `الشركة: <b>${broker?.name ?? "—"}</b>\n` +
        `من: ${d.authorName}\n` +
        `السؤال: ${excerpt}\n\n` +
        (broker?.slug ? `${getSiteUrl()}/brokers/${broker.slug}#board` : "")
    );
  }

  return { ok: true };
}

/** Admin: delete any post (and its replies cascade). */
export async function deleteBoardPost(id: string): Promise<ActionResult> {
  const { supabase, isAdmin } = await currentUser();
  if (!isAdmin) return { ok: false, error: "غير مصرّح" };
  const { error } = await supabase.from("broker_posts").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

const voteSchema = z.object({
  postId: z.string().uuid(),
  value: z.union([z.literal(1), z.literal(-1)]),
  voterKey: z.string().trim().min(6).max(80),
});

/** Public: toggle a like/dislike. Re-clicking the same value removes it. */
export async function voteBoardPost(input: unknown): Promise<ActionResult> {
  const parsed = voteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "تصويت غير صالح" };
  const d = parsed.data;
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("broker_post_votes")
    .select("id,value")
    .eq("post_id", d.postId)
    .eq("voter_key", d.voterKey)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase
      .from("broker_post_votes")
      .insert({ post_id: d.postId, voter_key: d.voterKey, value: d.value });
    if (error) return { ok: false, error: error.message };
  } else if (existing.value === d.value) {
    await supabase.from("broker_post_votes").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("broker_post_votes")
      .update({ value: d.value })
      .eq("id", existing.id);
  }
  return { ok: true };
}
