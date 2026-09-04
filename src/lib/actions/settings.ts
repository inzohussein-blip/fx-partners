"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validators";

type ActionResult = { ok: boolean; error?: string };

/** Update the current partner's own profile (RLS restricts to self). */
export async function updateProfile(input: unknown): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "غير مصرّح" };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name || null,
      company_name: parsed.data.company_name || null,
      country: parsed.data.country || null,
      phone: parsed.data.phone || null,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/settings");
  return { ok: true };
}

/**
 * Generate a one-time Telegram link token and return the bot deep link.
 * The agent opens it and presses Start; the telegram-bot webhook stores
 * their chat id against this token.
 */
export async function generateTelegramLink(): Promise<{
  ok: boolean;
  url?: string;
  error?: string;
}> {
  const botUser = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  if (!botUser) {
    return { ok: false, error: "لم يتم إعداد بوت تليغرام بعد." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "غير مصرّح" };

  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const { error } = await supabase
    .from("profiles")
    .update({ telegram_link_token: token })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  return { ok: true, url: `https://t.me/${botUser}?start=${token}` };
}
