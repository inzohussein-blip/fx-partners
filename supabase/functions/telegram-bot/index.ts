// ===========================================================================
// Supabase Edge Function: telegram-bot  (Telegram webhook)
// ---------------------------------------------------------------------------
// Handles Telegram updates. When an agent opens the bot deep link
// (t.me/<bot>?start=<token>) and presses Start, this links their chat id to
// the matching partner profile so they receive alerts.
//
// Deploy (public — Telegram sends no JWT):
//   supabase functions deploy telegram-bot --no-verify-jwt
// Secret:
//   supabase secrets set TELEGRAM_BOT_TOKEN=123456:abc...
// Register the webhook once:
//   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=\
//     https://<project-ref>.supabase.co/functions/v1/telegram-bot"
// (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.)
// ===========================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("ok");

  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  const update = await req.json().catch(() => null);
  const message = update?.message;
  const text: string = message?.text ?? "";
  const chatId = message?.chat?.id;

  async function reply(t: string) {
    if (!token || !chatId) return;
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: t, parse_mode: "HTML" }),
    });
  }

  const match = text.match(/^\/start\s+(\S+)/);
  if (match && supabaseUrl && serviceKey) {
    const admin = createClient(supabaseUrl, serviceKey);
    const linkToken = match[1];
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("telegram_link_token", linkToken)
      .maybeSingle();

    if (profile) {
      await admin
        .from("profiles")
        .update({ telegram_chat_id: String(chatId), telegram_link_token: null })
        .eq("id", profile.id);
      await reply(
        "✅ تم ربط حسابك في <b>FX Partners</b> بنجاح!\nستصلك تنبيهات الإحالات والعمولات هنا."
      );
    } else {
      await reply(
        "رمز الربط غير صالح أو مُستخدَم. أنشئ رابطاً جديداً من صفحة الإعدادات في لوحة التحكم."
      );
    }
  } else if (text === "/start") {
    await reply(
      "مرحباً بك في بوت <b>FX Partners</b> 👋\nاربط حسابك من صفحة الإعدادات في لوحة التحكم لاستقبال التنبيهات."
    );
  }

  return new Response("ok");
});
