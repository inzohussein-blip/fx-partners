import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendTelegram } from "@/lib/telegram";

/**
 * Telegram alert hook. Called by database triggers (referrals / earnings)
 * to notify the responsible agent on Telegram. Guarded by TELEGRAM_HOOK_SECRET.
 *
 * Body: { type: "referral" | "earning", record: { ib_id, amount?, currency? } }
 */
export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_HOOK_SECRET;
  if (secret && req.headers.get("x-hook-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    return NextResponse.json({ ok: false, reason: "no-service-key" });
  }

  let body: {
    type?: string;
    record?: { ib_id?: string; amount?: number; currency?: string };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const type = body?.type;
  const ibId = body?.record?.ib_id;
  if (!ibId) return NextResponse.json({ error: "no ib_id" }, { status: 400 });

  const admin = createClient(url, service);

  const { data: ib } = await admin
    .from("ib_accounts")
    .select("user_id")
    .eq("id", ibId)
    .maybeSingle();
  if (!ib) return NextResponse.json({ ok: true, skipped: "no-ib" });

  const { data: profile } = await admin
    .from("profiles")
    .select("telegram_chat_id, full_name")
    .eq("id", ib.user_id)
    .maybeSingle();

  const chatId = profile?.telegram_chat_id;
  if (!chatId) return NextResponse.json({ ok: true, skipped: "not-linked" });

  const name = profile?.full_name ? ` ${profile.full_name}` : "";
  let text: string;
  if (type === "earning") {
    const amount = body.record?.amount ?? 0;
    const currency = body.record?.currency ?? "USD";
    text =
      `💰 <b>عمولة جديدة!</b>\n` +
      `مرحباً${name}، وصلت عمولة بقيمة <b>${amount} ${currency}</b> إلى محفظتك في FX Partners.`;
  } else {
    text =
      `🎉 <b>إحالة جديدة!</b>\n` +
      `مرحباً${name}، سجّل عميل جديد عبر رابط إحالتك في FX Partners.`;
  }

  await sendTelegram(chatId, text);
  return NextResponse.json({ ok: true });
}
