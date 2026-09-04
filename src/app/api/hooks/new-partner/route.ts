import { NextResponse } from "next/server";
import { sendPartnerEmail } from "@/lib/email";

/**
 * Automatic welcome email hook. Called by a Supabase database trigger /
 * webhook when a new partner profile is created. Protected by a shared
 * secret (EMAIL_HOOK_SECRET) sent as the `x-hook-secret` header.
 *
 * Expected body (Supabase DB webhook shape):
 *   { type, table, record: { email, full_name, ... }, ... }
 * A flat { email, full_name } body is also accepted.
 */
export async function POST(req: Request) {
  const secret = process.env.EMAIL_HOOK_SECRET;
  if (secret && req.headers.get("x-hook-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const payload = body as {
    record?: { email?: string; full_name?: string | null };
    email?: string;
    full_name?: string | null;
  };
  const record = payload?.record ?? payload;
  const email = record?.email;
  const name = record?.full_name ?? undefined;

  if (!email) {
    return NextResponse.json({ error: "no email in payload" }, { status: 400 });
  }

  await sendPartnerEmail("welcome", email, { name });
  return NextResponse.json({ ok: true });
}
