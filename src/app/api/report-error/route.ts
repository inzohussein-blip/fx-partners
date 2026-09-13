import { NextResponse } from "next/server";
import { z } from "zod";
import { sendTelegram, escapeTelegram as esc } from "@/lib/telegram";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({
  message: z.string().trim().min(1).max(500),
  digest: z.string().trim().max(64).optional(),
  path: z.string().trim().max(300).optional(),
  // "server" errors come from a rendered error boundary; "client" from an
  // unhandled rejection in the browser.
  kind: z.enum(["server", "client"]).default("server"),
});

/**
 * Error reporting.
 *
 * The site had none: an error boundary that only called console.error, which
 * nobody reads on a production deployment. A visitor hitting a broken page had
 * no way of telling anyone, and neither did the page.
 *
 * Reports go to the Telegram channel the owner already watches for contact
 * messages and bookings, rather than adding a monitoring dependency and an
 * account to a site measured on mobile page weight.
 *
 * Rate limited hard, per IP: an error loop is exactly the shape of traffic
 * that turns a useful alert channel into one nobody looks at any more.
 */
export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req.headers, "err"), {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  // Always 204 to the caller. A reporting endpoint that answers "you are
  // rate limited" invites probing and tells a visitor about plumbing they
  // did not ask about; the page has already shown them the error state.
  if (!limit.ok) return new NextResponse(null, { status: 204 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return new NextResponse(null, { status: 204 });
  const d = parsed.data;

  const chat = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (chat) {
    await sendTelegram(
      chat,
      `🚨 <b>خطأ في الموقع</b>\n` +
        `النوع: ${d.kind === "server" ? "خادم" : "متصفّح"}\n` +
        (d.path ? `الصفحة: ${esc(d.path)}\n` : "") +
        (d.digest ? `المعرّف: <code>${esc(d.digest)}</code>\n` : "") +
        `\n${esc(d.message)}`
    );
  }

  return new NextResponse(null, { status: 204 });
}
