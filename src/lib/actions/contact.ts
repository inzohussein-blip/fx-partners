"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { sendTelegram, escapeTelegram as esc } from "@/lib/telegram";
import { rateLimit, clientKey } from "@/lib/rate-limit";

type ActionResult = { ok: boolean; error?: string };

const schema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب").max(80),
  email: z.string().trim().email("بريد إلكتروني غير صالح"),
  subject: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(5, "الرسالة قصيرة جداً").max(2000),
  /**
   * Honeypot. The field is present in the form but hidden from people and
   * from assistive technology, so a human never fills it and most automated
   * submitters fill everything they find. Anything with a value here is
   * dropped — and answered with the same success message, because telling a
   * bot it was detected only teaches it to try again differently.
   */
  company: z.string().max(200).optional(),
  /** Milliseconds between the form rendering and being submitted. */
  elapsed: z.number().optional(),
});

/** Public: send a contact message. Notifies the site owner on Telegram. */
export async function sendContactMessage(input: unknown): Promise<ActionResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "بيانات غير صالحة" };
  }
  const d = parsed.data;

  // This action relays straight into the owner's Telegram with no account and
  // no human check in front of it. Unlimited, one script makes that channel
  // useless — and the channel also carries booking requests and new-partner
  // alerts, so losing it is not a small thing.
  const limit = rateLimit(clientKey(headers(), "contact"), {
    limit: 3,
    windowMs: 10 * 60 * 1000,
  });
  if (!limit.ok) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfter / 60));
    return {
      ok: false,
      error: `أرسلت عدة رسائل للتو. انتظر ${minutes} دقيقة ثم حاول مرة أخرى.`,
    };
  }

  // Silent drops: a filled honeypot, or a form submitted faster than anyone
  // could have typed it. Both report success so the sender learns nothing.
  if (d.company && d.company.trim()) return { ok: true };
  if (typeof d.elapsed === "number" && d.elapsed >= 0 && d.elapsed < 2000) {
    return { ok: true };
  }

  const adminChat = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (adminChat) {
    await sendTelegram(
      adminChat,
      `📨 <b>رسالة تواصل جديدة</b>\n` +
        `الاسم: ${esc(d.name)}\n` +
        `البريد: ${esc(d.email)}\n` +
        (d.subject ? `الموضوع: ${esc(d.subject)}\n` : "") +
        `\n${esc(d.message)}`
    );
  }

  // Best-effort: succeed even if Telegram isn't configured, so the visitor
  // still gets a confirmation and the site owner can rely on email fallback.
  return { ok: true };
}
