"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { eventTimeLabel } from "@/lib/news-alerts";
import { indicatorBySlug } from "@/lib/indicators";

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

export type EventInput = {
  title: string;
  description?: string;
  kind: string;
  country?: string;
  brokerId?: string | null;
  eventDate: string;
  eventTime?: string;
  /** Exact release instant (ISO), news events only: drives the Telegram alert. */
  startsAt?: string | null;
  /** Indicator guide slug, news events only. */
  indicator?: string | null;
};

export async function saveEvent(input: EventInput): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  if (!input.title?.trim()) return { ok: false, error: "العنوان مطلوب" };
  if (!input.eventDate) return { ok: false, error: "التاريخ مطلوب" };

  const isNews = input.kind === "news";
  let startsAt: string | null = null;
  if (isNews && input.startsAt) {
    const d = new Date(input.startsAt);
    if (Number.isNaN(d.getTime())) return { ok: false, error: "وقت الصدور غير صالح" };
    startsAt = d.toISOString();
  }
  const indicator =
    isNews && input.indicator && indicatorBySlug(input.indicator) ? input.indicator : null;

  const { error } = await supabase.from("broker_events").insert({
    title: input.title.trim(),
    description: input.description?.trim() || null,
    kind: input.kind || "holiday",
    country: input.country?.trim() || null,
    broker_id: input.brokerId || null,
    event_date: input.eventDate,
    event_time: input.eventTime?.trim() || (startsAt ? eventTimeLabel(startsAt) : null),
    starts_at: startsAt,
    indicator,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/calendar");
  revalidatePath("/dashboard/admin/events");
  return { ok: true };
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  const { error } = await supabase.from("broker_events").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/calendar");
  revalidatePath("/dashboard/admin/events");
  return { ok: true };
}

export async function setEventActive(id: string, active: boolean): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  const { error } = await supabase
    .from("broker_events")
    .update({ is_active: active })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/calendar");
  revalidatePath("/dashboard/admin/events");
  return { ok: true };
}
