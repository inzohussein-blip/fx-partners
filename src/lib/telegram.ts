/**
 * Send a message to a Telegram chat via the Bot API. Server-only.
 * Best-effort: returns false instead of throwing when unconfigured/failed.
 */
/**
 * Escape text for Telegram's HTML parse mode.
 *
 * Messages are sent with parse_mode "HTML" and several callers interpolate
 * user-supplied text (the public contact form, forum titles). Unescaped, a
 * visitor can inject markup that makes their message look like a system
 * notice — and, more commonly, a plain "<" or "&" in a legitimate message
 * makes Telegram reject the whole thing, so the notification silently never
 * arrives.
 */
export function escapeTelegram(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function sendTelegram(chatId: string, text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
