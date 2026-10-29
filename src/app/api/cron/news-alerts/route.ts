import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendTelegram } from "@/lib/telegram";
import { getSiteUrl } from "@/lib/utils";
import { ALERT_LEAD_MINUTES, formatAlert, type DueEvent } from "@/lib/news-alerts";

/**
 * Posts a Telegram reminder to the signals channel about an hour before each
 * upcoming news event that has an exact release time.
 *
 * Called on a schedule (.github/workflows/news-alerts.yml, or Vercel Cron)
 * with `Authorization: Bearer <CRON_SECRET>`. Each event is claimed by
 * setting alert_sent_at before sending, so overlapping runs never post twice;
 * a failed send releases the claim for the next run.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ ok: false, reason: "no-cron-secret" }, { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const channel = process.env.TELEGRAM_SIGNALS_CHAT_ID;
  if (!url || !service) return NextResponse.json({ ok: false, reason: "no-service-key" });
  if (!channel || !process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ ok: false, reason: "no-telegram" });
  }

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const now = new Date();
  const until = new Date(now.getTime() + ALERT_LEAD_MINUTES * 60_000);

  const { data, error } = await admin
    .from("broker_events")
    .select("id,title,country,starts_at,indicator")
    .eq("kind", "news")
    .eq("is_active", true)
    .is("alert_sent_at", null)
    .gt("starts_at", now.toISOString())
    .lte("starts_at", until.toISOString())
    .order("starts_at", { ascending: true })
    .limit(20);
  if (error) return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });

  const site = getSiteUrl();
  let sent = 0;
  for (const e of (data as DueEvent[]) ?? []) {
    // Claim first: only the run that flips alert_sent_at from null sends.
    const { data: claimed } = await admin
      .from("broker_events")
      .update({ alert_sent_at: now.toISOString() })
      .eq("id", e.id)
      .is("alert_sent_at", null)
      .select("id");
    if (!claimed?.length) continue;

    if (await sendTelegram(channel, formatAlert(e, now, site))) {
      sent++;
    } else {
      await admin.from("broker_events").update({ alert_sent_at: null }).eq("id", e.id);
    }
  }

  return NextResponse.json({ ok: true, due: data?.length ?? 0, sent });
}
