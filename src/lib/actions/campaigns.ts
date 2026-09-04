"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendTelegram } from "@/lib/telegram";
import { getSiteUrl } from "@/lib/utils";

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

export type CampaignInput = {
  brokerId?: string | null;
  title: string;
  message: string;
  ctaLabel?: string;
};

export async function publishCampaign(input: CampaignInput): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  if (!input.title?.trim()) return { ok: false, error: "العنوان مطلوب" };
  if (!input.message?.trim()) return { ok: false, error: "نص العرض مطلوب" };

  let brokerSlug: string | null = null;
  if (input.brokerId) {
    const { data } = await supabase
      .from("brokers")
      .select("slug")
      .eq("id", input.brokerId)
      .maybeSingle();
    brokerSlug = data?.slug ?? null;
  }

  const { error } = await supabase.from("campaigns").insert({
    broker_id: input.brokerId || null,
    broker_slug: brokerSlug,
    title: input.title.trim(),
    message: input.message.trim(),
    cta_label: input.ctaLabel?.trim() || "سجّل الآن",
    is_active: true,
  });
  if (error) return { ok: false, error: error.message };

  // Also nudge the Telegram channel, if configured (best-effort).
  const channel = process.env.TELEGRAM_SIGNALS_CHAT_ID;
  if (channel) {
    await sendTelegram(
      channel,
      `🎯 <b>${input.title.trim()}</b>\n${input.message.trim()}\n\n${getSiteUrl()}/offers`
    );
  }

  revalidatePath("/offers");
  revalidatePath("/dashboard/admin/campaigns");
  return { ok: true };
}

export async function setCampaignActive(
  id: string,
  active: boolean
): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  const { error } = await supabase
    .from("campaigns")
    .update({ is_active: active })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/offers");
  revalidatePath("/dashboard/admin/campaigns");
  return { ok: true };
}

export async function deleteCampaign(id: string): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/offers");
  revalidatePath("/dashboard/admin/campaigns");
  return { ok: true };
}
