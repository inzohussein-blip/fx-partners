"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendTelegram } from "@/lib/telegram";
import { sendRawEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/utils";
import { BADGE_KEYS } from "@/lib/brokers";

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
  badges?: string[];
};

export async function saveBroker(input: BrokerInput): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  if (!input.name?.trim()) return { ok: false, error: "اسم الشركة مطلوب" };

  const status = input.status === "partnered" ? "partnered" : "not_partnered";
  const badges = Array.isArray(input.badges)
    ? input.badges.filter((b) => BADGE_KEYS.includes(b))
    : undefined;
  const row = {
    name: input.name.trim(),
    logo_url: input.logo_url?.trim() || null,
    status,
    deposit_bonus: input.deposit_bonus?.trim() || null,
    welcome_bonus: input.welcome_bonus?.trim() || null,
    description: input.description?.trim() || null,
    is_published: input.is_published ?? true,
    sort_order: Number(input.sort_order ?? 0),
    ...(badges ? { badges } : {}),
  };

  let error;
  let slug = input.slug;
  if (input.id) {
    // Capture the previous bonus/terms to detect a change for alerts.
    const { data: prev } = await supabase
      .from("brokers")
      .select("slug,deposit_bonus,welcome_bonus")
      .eq("id", input.id)
      .maybeSingle();
    ({ error } = await supabase.from("brokers").update(row).eq("id", input.id));
    if (!error && prev) {
      slug = prev.slug;
      const depChanged = (prev.deposit_bonus ?? "") !== (row.deposit_bonus ?? "");
      const welChanged = (prev.welcome_bonus ?? "") !== (row.welcome_bonus ?? "");
      if (depChanged || welChanged) {
        await notifyBonusChange(input.id, row.name, prev.slug, {
          deposit: row.deposit_bonus,
          welcome: row.welcome_bonus,
        });
      }
    }
  } else {
    slug = (input.slug?.trim() && slugify(input.slug)) || slugify(input.name);
    ({ error } = await supabase.from("brokers").insert({ ...row, slug }));
  }
  if (error) return { ok: false, error: error.message };

  revalidatePath("/compare");
  if (slug) revalidatePath(`/brokers/${slug}`);
  revalidatePath("/dashboard/admin/brokers");
  return { ok: true };
}

/** Email a broker's subscribers when its bonus/terms change (best-effort). */
async function notifyBonusChange(
  brokerId: string,
  name: string,
  slug: string,
  bonus: { deposit: string | null; welcome: string | null }
) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return;
    const { createClient: create } = await import("@supabase/supabase-js");
    const admin = create(url, key);

    const { data: subs } = await admin
      .from("broker_subscriptions")
      .select("email")
      .eq("broker_id", brokerId)
      .limit(500);
    if (!subs || subs.length === 0) return;

    const link = `${getSiteUrl()}/brokers/${slug}`;
    const html = `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#0b1526;color:#e2e8f0;padding:28px;border-radius:16px">
        <h2 style="color:#22d3ee;margin:0 0 8px">تحديث عروض ${name}</h2>
        <p style="color:#94a3b8;margin:0 0 16px">تم تحديث عروض هذه الشركة التي اشتركت في تنبيهاتها:</p>
        <ul style="font-size:14px;line-height:1.9;padding-inline-start:18px">
          ${bonus.deposit ? `<li>بونص الإيداع: <b>${bonus.deposit}</b></li>` : ""}
          ${bonus.welcome ? `<li>البونص الترحيبي: <b>${bonus.welcome}</b></li>` : ""}
        </ul>
        <a href="${link}" style="display:inline-block;margin-top:16px;background:#2563eb;color:#fff;text-decoration:none;padding:12px 22px;border-radius:12px;font-weight:700">عرض التفاصيل</a>
      </div>`;

    for (const s of subs as { email: string }[]) {
      await sendRawEmail(s.email, `تحديث عروض ${name} — FX Partners`, html);
    }
  } catch {
    /* best-effort */
  }
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

  // Notify the site owner so they can moderate quickly (best-effort).
  const adminChat = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (adminChat) {
    const { data: broker } = await supabase
      .from("brokers")
      .select("name")
      .eq("id", d.brokerId)
      .maybeSingle();
    const excerpt =
      d.comment.length > 160 ? d.comment.slice(0, 160) + "…" : d.comment;
    await sendTelegram(
      adminChat,
      `📝 <b>مراجعة جديدة بانتظار الموافقة</b>\n` +
        `الشركة: <b>${broker?.name ?? "—"}</b>\n` +
        `التقييم: ${"⭐".repeat(d.stars)} (${d.stars}/5)\n` +
        `الاسم: ${d.userName}\n` +
        `التعليق: ${excerpt}\n\n` +
        `راجِعها: ${getSiteUrl()}/dashboard/admin/brokers`
    );
  }

  revalidatePath(`/brokers/${d.brokerSlug}`);
  return { ok: true };
}

const subscribeSchema = z.object({
  brokerId: z.string().uuid(),
  email: z.string().trim().email("بريد إلكتروني غير صالح"),
});

/** Public: subscribe an email to a broker's bonus/terms alerts. */
export async function subscribeBroker(input: unknown): Promise<ActionResult> {
  const parsed = subscribeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "بريد غير صالح" };
  }
  const d = parsed.data;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("broker_subscriptions").upsert(
    { broker_id: d.brokerId, email: d.email.toLowerCase(), user_id: user?.id ?? null },
    { onConflict: "broker_id,email", ignoreDuplicates: true }
  );
  if (error) return { ok: false, error: error.message };
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
