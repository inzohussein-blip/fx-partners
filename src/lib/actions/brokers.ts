"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: boolean; error?: string };

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, admin: false as const };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return { supabase, admin: profile?.role === "admin" };
}

/** Latin-friendly slug; falls back to a random suffix for non-latin names. */
function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (base) return base;
  return "broker-" + Math.random().toString(36).slice(2, 8);
}

// ---- BROKERS --------------------------------------------------------------

export type BrokerInput = {
  id?: string;
  slug?: string;
  name: string;
  logo_url?: string;
  status?: "partnered" | "not_partnered";
  deposit_bonus?: string;
  welcome_bonus?: string;
  description?: string;
  is_published?: boolean;
  sort_order?: number;
};

export async function saveBroker(input: BrokerInput): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  if (!input.name?.trim()) return { ok: false, error: "اسم الشركة مطلوب" };

  const status = input.status === "partnered" ? "partnered" : "not_partnered";
  const row = {
    name: input.name.trim(),
    logo_url: input.logo_url?.trim() || null,
    status,
    deposit_bonus: input.deposit_bonus?.trim() || null,
    welcome_bonus: input.welcome_bonus?.trim() || null,
    description: input.description?.trim() || null,
    is_published: input.is_published ?? true,
    sort_order: Number(input.sort_order ?? 0),
  };

  let error;
  if (input.id) {
    ({ error } = await supabase.from("brokers").update(row).eq("id", input.id));
  } else {
    const slug = (input.slug?.trim() && slugify(input.slug)) || slugify(input.name);
    ({ error } = await supabase.from("brokers").insert({ ...row, slug }));
  }
  if (error) return { ok: false, error: error.message };

  revalidatePath("/compare");
  revalidatePath("/dashboard/admin/brokers");
  return { ok: true };
}

export async function deleteBroker(id: string): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  const { error } = await supabase.from("brokers").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/compare");
  revalidatePath("/dashboard/admin/brokers");
  return { ok: true };
}

// ---- BROKER LINKS ---------------------------------------------------------

export type BrokerLinkInput = {
  id?: string;
  broker_id: string;
  label?: string;
  referral_url: string;
  agent_commission?: string;
  client_benefits?: string;
  sort_order?: number;
};

export async function saveBrokerLink(
  input: BrokerLinkInput
): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  if (!input.broker_id) return { ok: false, error: "الشركة مطلوبة" };
  if (!input.referral_url?.trim()) return { ok: false, error: "رابط الإحالة مطلوب" };

  const row = {
    broker_id: input.broker_id,
    label: input.label?.trim() || null,
    referral_url: input.referral_url.trim(),
    agent_commission: input.agent_commission?.trim() || null,
    client_benefits: input.client_benefits?.trim() || null,
    sort_order: Number(input.sort_order ?? 0),
  };

  const query = input.id
    ? supabase.from("broker_links").update(row).eq("id", input.id)
    : supabase.from("broker_links").insert(row);
  const { error } = await query;
  if (error) return { ok: false, error: error.message };

  revalidatePath("/compare");
  revalidatePath("/dashboard/admin/brokers");
  return { ok: true };
}

export async function deleteBrokerLink(id: string): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  const { error } = await supabase.from("broker_links").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/compare");
  revalidatePath("/dashboard/admin/brokers");
  return { ok: true };
}

// ---- REVIEWS (public submit + admin moderation) ---------------------------

const reviewSchema = z.object({
  brokerId: z.string().uuid(),
  brokerSlug: z.string().min(1),
  userName: z.string().trim().min(2, "الاسم مطلوب").max(60),
  comment: z.string().trim().min(3, "التعليق قصير جداً").max(1000),
  stars: z.coerce.number().int().min(1).max(5),
});

/** Public: submit a review. Stored unapproved (moderation queue). */
export async function submitBrokerReview(input: unknown): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "بيانات غير صالحة" };
  }
  const d = parsed.data;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("broker_reviews").insert({
    broker_id: d.brokerId,
    user_id: user?.id ?? null,
    user_name: d.userName,
    comment: d.comment,
    stars: d.stars,
    is_approved: false,
    is_admin_reply: false,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/brokers/${d.brokerSlug}`);
  return { ok: true };
}

export async function approveReview(id: string): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  const { error } = await supabase
    .from("broker_reviews")
    .update({ is_approved: true })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/admin/brokers");
  revalidatePath("/compare");
  return { ok: true };
}

export async function deleteReview(id: string): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  const { error } = await supabase.from("broker_reviews").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/admin/brokers");
  return { ok: true };
}

/** Admin: post an official review/reply (approved + flagged as admin). */
export async function addAdminReview(input: {
  brokerId: string;
  comment: string;
  stars: number;
  displayName?: string;
}): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  if (!input.comment?.trim()) return { ok: false, error: "النص مطلوب" };
  const stars = Math.min(5, Math.max(1, Number(input.stars) || 5));

  const { error } = await supabase.from("broker_reviews").insert({
    broker_id: input.brokerId,
    user_name: input.displayName?.trim() || "إدارة FX Partners",
    comment: input.comment.trim(),
    stars,
    is_approved: true,
    is_admin_reply: true,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/admin/brokers");
  revalidatePath("/compare");
  return { ok: true };
}
