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

const DIRECTION_LABEL: Record<string, string> = {
  buy: "🟢 شراء",
  sell: "🔴 بيع",
  neutral: "⚪ محايد",
};

export type SignalInput = {
  id?: string;
  brokerId?: string | null;
  title: string;
  body: string;
  symbol?: string;
  direction?: string;
  broadcast?: boolean;
};

export async function saveSignal(input: SignalInput): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  if (!input.title?.trim()) return { ok: false, error: "العنوان مطلوب" };
  if (!input.body?.trim()) return { ok: false, error: "نص التوصية مطلوب" };

  const dir: string | null = ["buy", "sell", "neutral"].includes(
    input.direction ?? ""
  )
    ? (input.direction as string)
    : null;

  const row = {
    broker_id: input.brokerId || null,
    title: input.title.trim(),
    body: input.body.trim(),
    symbol: input.symbol?.trim() || null,
    direction: dir,
    is_published: true,
  };

  let signalId = input.id;
  if (input.id) {
    const { error } = await supabase.from("signals").update(row).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await supabase
      .from("signals")
      .insert(row)
      .select("id")
      .maybeSingle();
    if (error) return { ok: false, error: error.message };
    signalId = data?.id;
  }

  // Broadcast to Telegram channel + outbound webhooks (best-effort).
  if (input.broadcast !== false) {
    await broadcastSignal(supabase, { ...row, id: signalId });
  }

  revalidatePath("/dashboard/signals");
  revalidatePath("/dashboard/admin/signals");
  return { ok: true };
}

async function broadcastSignal(
  supabase: ReturnType<typeof createClient>,
  signal: {
    id?: string;
    title: string;
    body: string;
    symbol: string | null;
    direction: string | null;
    broker_id: string | null;
  }
) {
  let brokerName: string | null = null;
  if (signal.broker_id) {
    const { data } = await supabase
      .from("brokers")
      .select("name")
      .eq("id", signal.broker_id)
      .maybeSingle();
    brokerName = data?.name ?? null;
  }

  const dirText = signal.direction ? DIRECTION_LABEL[signal.direction] ?? "" : "";
  const text =
    `📊 <b>${signal.title}</b>\n` +
    (signal.symbol ? `الأداة: <b>${signal.symbol}</b>\n` : "") +
    (dirText ? `الاتجاه: ${dirText}\n` : "") +
    (brokerName ? `الشركة: ${brokerName}\n` : "") +
    `\n${signal.body}\n\n` +
    `${getSiteUrl()}/dashboard/signals`;

  // 1) Telegram channel.
  const channel = process.env.TELEGRAM_SIGNALS_CHAT_ID;
  if (channel) await sendTelegram(channel, text);

  // 2) Outbound webhooks (Discord/Skype/custom).
  const { data: hooks } = await supabase
    .from("outbound_webhooks")
    .select("url")
    .eq("is_active", true);

  const payload = {
    type: "signal",
    title: signal.title,
    body: signal.body,
    symbol: signal.symbol,
    direction: signal.direction,
    broker: brokerName,
    // Discord-compatible field so a Discord webhook renders it directly.
    content: text.replace(/<\/?b>/g, "**"),
  };

  await Promise.all(
    (hooks ?? []).map((h) =>
      fetch(h.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => null)
    )
  );
}

export async function deleteSignal(id: string): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  const { error } = await supabase.from("signals").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/signals");
  revalidatePath("/dashboard/admin/signals");
  return { ok: true };
}

export async function addWebhook(
  url: string,
  label?: string
): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  if (!/^https?:\/\//.test(url.trim())) return { ok: false, error: "رابط غير صالح" };
  const { error } = await supabase
    .from("outbound_webhooks")
    .insert({ url: url.trim(), label: label?.trim() || null });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/admin/signals");
  return { ok: true };
}

export async function deleteWebhook(id: string): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  const { error } = await supabase.from("outbound_webhooks").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/admin/signals");
  return { ok: true };
}
