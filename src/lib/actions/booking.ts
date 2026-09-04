"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendTelegram } from "@/lib/telegram";
import { sendRawEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/utils";

type ActionResult = { ok: boolean; error?: string; meetingUrl?: string | null };

/** Service-role client for locked-down writes (bookings table). */
async function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const { createClient: create } = await import("@supabase/supabase-js");
  return create(url, key);
}

const bookingSchema = z.object({
  slotId: z.string().uuid("اختر موعداً متاحاً"),
  companyName: z.string().trim().min(2, "اسم الشركة مطلوب").max(120),
  contactName: z.string().trim().min(2, "اسم المسؤول مطلوب").max(120),
  email: z.string().trim().email("بريد إلكتروني غير صالح"),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  meetingType: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

const TYPE_LABEL: Record<string, string> = {
  broker: "شركة تداول (Broker)",
  master_ib: "وكيل رئيسي (Master IB)",
  liquidity: "مزوّد سيولة",
  technology: "شركة تقنية مالية",
};

function fmtWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("ar", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Public: book an open B2B meeting slot. Notifies admin on Telegram + emails the requester. */
export async function bookMeeting(input: unknown): Promise<ActionResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "بيانات غير صالحة" };
  }
  const d = parsed.data;

  const admin = await adminClient();
  if (!admin) return { ok: false, error: "الحجز غير متاح حالياً. تواصل معنا مباشرة." };

  // Atomically claim the slot: only flip an OPEN slot to booked.
  const { data: slot, error: claimErr } = await admin
    .from("meeting_slots")
    .update({ status: "booked" })
    .eq("id", d.slotId)
    .eq("status", "open")
    .select("id, starts_at, duration_min, meeting_url")
    .maybeSingle();

  if (claimErr) return { ok: false, error: "تعذّر الحجز، حاول مجدداً." };
  if (!slot) return { ok: false, error: "هذا الموعد لم يعد متاحاً، اختر موعداً آخر." };

  const { error: insErr } = await admin.from("bookings").insert({
    slot_id: slot.id,
    company_name: d.companyName,
    contact_name: d.contactName,
    email: d.email,
    phone: d.phone || null,
    meeting_type: d.meetingType || null,
    message: d.message || null,
    status: "confirmed",
  });

  if (insErr) {
    // Roll the slot back so it can be booked again.
    await admin.from("meeting_slots").update({ status: "open" }).eq("id", slot.id);
    return { ok: false, error: "تعذّر حفظ الحجز، حاول مجدداً." };
  }

  const when = fmtWhen(slot.starts_at);
  const typeLabel = d.meetingType ? TYPE_LABEL[d.meetingType] ?? d.meetingType : "—";
  const link = slot.meeting_url || `${getSiteUrl()}/brokers`;

  // 1) Telegram alert to the site owner (best-effort).
  const adminChat = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (adminChat) {
    await sendTelegram(
      adminChat,
      `📅 <b>حجز اجتماع B2B جديد</b>\n` +
        `الشركة: <b>${d.companyName}</b>\n` +
        `المسؤول: ${d.contactName}\n` +
        `النوع: ${typeLabel}\n` +
        `الموعد: ${when} (UTC)\n` +
        `البريد: ${d.email}` +
        (d.phone ? `\nالهاتف: ${d.phone}` : "") +
        (d.message ? `\nملاحظة: ${d.message}` : "")
    );
  }

  // 2) Confirmation email to the requester (best-effort).
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#0b1526;color:#e2e8f0;padding:28px;border-radius:16px">
      <h2 style="color:#22d3ee;margin:0 0 8px">تم تأكيد موعد اجتماعك</h2>
      <p style="color:#94a3b8;margin:0 0 20px">شكراً ${d.contactName}، حجزك مع فريق شراكات FX Partners مؤكّد.</p>
      <table style="width:100%;font-size:14px">
        <tr><td style="color:#64748b;padding:6px 0">الموعد</td><td style="text-align:left">${when} (UTC)</td></tr>
        <tr><td style="color:#64748b;padding:6px 0">المدة</td><td style="text-align:left">${slot.duration_min} دقيقة</td></tr>
        <tr><td style="color:#64748b;padding:6px 0">الشركة</td><td style="text-align:left">${d.companyName}</td></tr>
      </table>
      <a href="${link}" style="display:inline-block;margin-top:20px;background:#2563eb;color:#fff;text-decoration:none;padding:12px 22px;border-radius:12px;font-weight:700">رابط الاجتماع</a>
      <p style="color:#64748b;font-size:12px;margin-top:20px">إن لم تظهر رابط الاجتماع بعد، سنرسله إليك قبل الموعد.</p>
    </div>`;
  await sendRawEmail(d.email, "تأكيد موعد اجتماع FX Partners", html);

  revalidatePath("/brokers");
  revalidatePath("/dashboard/admin/meetings");
  return { ok: true, meetingUrl: slot.meeting_url };
}

// ---------------------------------------------------------------------------
// Admin: manage slots + bookings
// ---------------------------------------------------------------------------

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

/** Admin: publish a new open meeting slot. */
export async function addMeetingSlot(input: {
  startsAt: string;
  durationMin: number;
  meetingUrl?: string;
}): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };

  const startsAt = new Date(input.startsAt);
  if (isNaN(startsAt.getTime())) return { ok: false, error: "تاريخ غير صالح" };

  const { error } = await supabase.from("meeting_slots").insert({
    starts_at: startsAt.toISOString(),
    duration_min: Number(input.durationMin) || 30,
    meeting_url: input.meetingUrl?.trim() || null,
    status: "open",
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/admin/meetings");
  revalidatePath("/brokers");
  return { ok: true };
}

/** Admin: remove a slot (only if not booked). */
export async function deleteMeetingSlot(id: string): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };

  const { error } = await supabase
    .from("meeting_slots")
    .delete()
    .eq("id", id)
    .neq("status", "booked");
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/admin/meetings");
  revalidatePath("/brokers");
  return { ok: true };
}

/** Admin: update a booking's status. */
export async function updateBookingStatus(
  id: string,
  status: "pending" | "confirmed" | "cancelled"
): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };

  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/admin/meetings");
  return { ok: true };
}
