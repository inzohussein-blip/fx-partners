// ===========================================================================
// Supabase Edge Function: send-email
// ---------------------------------------------------------------------------
// Sends a pre-rendered HTML email (built with React Email in the Next.js app)
// via the Resend API. This keeps email delivery in Supabase Edge Functions
// while React Email rendering happens in the app.
//
// Deploy:   supabase functions deploy send-email
// Secrets:  supabase secrets set RESEND_API_KEY=re_xxx \
//             RESEND_FROM="FX Partners <partners@your-domain.com>"
//
// Invoked from the app via supabase.functions.invoke("send-email", { body }),
// or from a database webhook/trigger with a service-role token.
// ===========================================================================

interface Payload {
  to: string | string[];
  subject: string;
  html: string;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return json({ error: "Method Not Allowed" }, 405);
  }

  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM") ?? "FX Partners <onboarding@resend.dev>";
  if (!apiKey) {
    return json({ error: "RESEND_API_KEY is not set" }, 500);
  }

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { to, subject, html } = payload ?? ({} as Payload);
  if (!to || !subject || !html) {
    return json({ error: "Missing required fields: to, subject, html" }, 400);
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  const data = await res.json();
  return json(data, res.status);
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
