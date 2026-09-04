"use server";

import { z } from "zod";
import { sendTelegram } from "@/lib/telegram";

type ActionResult = { ok: boolean; error?: string };

const schema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب").max(80),
  email: z.string().trim().email("بريد إلكتروني غير صالح"),
  subject: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(5, "الرسالة قصيرة جداً").max(2000),
});

/** Public: send a contact message. Notifies the site owner on Telegram. */
export async function sendContactMessage(input: unknown): Promise<ActionResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "بيانات غير صالحة" };
  }
  const d = parsed.data;

  const adminChat = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (adminChat) {
    await sendTelegram(
      adminChat,
      `📨 <b>رسالة تواصل جديدة</b>\n` +
        `الاسم: ${d.name}\n` +
        `البريد: ${d.email}\n` +
        (d.subject ? `الموضوع: ${d.subject}\n` : "") +
        `\n${d.message}`
    );
  }

  // Best-effort: succeed even if Telegram isn't configured, so the visitor
  // still gets a confirmation and the site owner can rely on email fallback.
  return { ok: true };
}
