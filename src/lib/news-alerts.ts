import { escapeTelegram } from "@/lib/telegram";
import { indicatorBySlug } from "@/lib/indicators";

/**
 * Reminders go out for news events starting within this many minutes. The
 * scheduler runs every 15 minutes and can start late, so the window is wider
 * than the "about an hour before" the reminder promises.
 */
export const ALERT_LEAD_MINUTES = 75;

export type DueEvent = {
  id: string;
  title: string;
  country: string | null;
  starts_at: string;
  indicator: string | null;
};

/** Time of day in Mecca/Riyadh (UTC+3 all year), e.g. "15:30". */
export function meccaTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/** The Telegram message for one upcoming release (HTML parse mode). */
export function formatAlert(e: DueEvent, now: Date, siteUrl: string): string {
  const minutes = Math.max(1, Math.round((new Date(e.starts_at).getTime() - now.getTime()) / 60000));
  const guide = e.indicator ? indicatorBySlug(e.indicator) : undefined;
  const lines = [
    `⏰ <b>بعد ${minutes} دقيقة: ${escapeTelegram(e.title)}</b>`,
    `🕒 ${meccaTime(e.starts_at)} بتوقيت مكة${e.country ? ` · ${escapeTelegram(e.country)}` : ""}`,
    "",
    "⚠️ السبريد يتّسع والانزلاق السعري وارد وقت الخبر. حدّد حجم صفقتك ووقف الخسارة قبل الصدور.",
  ];
  if (guide) lines.push("", `📘 ما هو ${guide.code} ولماذا يحرّك السوق: ${siteUrl}/indicators/${guide.slug}`);
  lines.push("", `📅 المفكرة الاقتصادية: ${siteUrl}/calendar`);
  return lines.join("\n");
}

/**
 * Free-text time shown on /calendar for an event entered with an exact
 * instant, so the public page and the alert agree.
 */
export function eventTimeLabel(iso: string): string {
  return `${meccaTime(iso)} بتوقيت مكة`;
}
