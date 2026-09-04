"use server";

import { revalidatePath } from "next/cache";
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

export type CouponInput = {
  brokerId?: string | null;
  title: string;
  code: string;
  referralUrl?: string;
  description?: string;
};

export async function saveCoupon(input: CouponInput): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  if (!input.title?.trim()) return { ok: false, error: "العنوان مطلوب" };
  if (!input.code?.trim()) return { ok: false, error: "الكود مطلوب" };

  let brokerSlug: string | null = null;
  let brokerName: string | null = null;
  let referral = input.referralUrl?.trim() || null;

  if (input.brokerId) {
    const { data: broker } = await supabase
      .from("brokers")
      .select("slug,name,broker_links(code,referral_url)")
      .eq("id", input.brokerId)
      .maybeSingle();
    if (broker) {
      brokerSlug = broker.slug;
      brokerName = broker.name;
      // Prefer the broker's branded, tracked /go link when no URL was given.
      if (!referral) {
        const link = (broker.broker_links as { code: string | null; referral_url: string }[])?.[0];
        if (link?.code) referral = `/go/${link.code}`;
        else if (link?.referral_url) referral = link.referral_url;
      }
    }
  }

  const { error } = await supabase.from("coupons").insert({
    broker_id: input.brokerId || null,
    broker_slug: brokerSlug,
    broker_name: brokerName,
    title: input.title.trim(),
    code: input.code.trim(),
    referral_url: referral,
    description: input.description?.trim() || null,
    is_active: true,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/offers");
  revalidatePath("/dashboard/admin/campaigns");
  return { ok: true };
}

export async function setCouponActive(
  id: string,
  active: boolean
): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  const { error } = await supabase
    .from("coupons")
    .update({ is_active: active })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/offers");
  revalidatePath("/dashboard/admin/campaigns");
  return { ok: true };
}

export async function deleteCoupon(id: string): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/offers");
  revalidatePath("/dashboard/admin/campaigns");
  return { ok: true };
}
