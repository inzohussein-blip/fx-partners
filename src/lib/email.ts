import { createElement } from "react";
import { render } from "@react-email/render";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/utils";
import { WelcomeEmail } from "@/emails/welcome";
import { WithdrawalRequestedEmail } from "@/emails/withdrawal-requested";
import { MonthlyReportEmail } from "@/emails/monthly-report";

type Payloads = {
  welcome: { name?: string };
  withdrawal_requested: { name?: string; amount: string; method: string };
  monthly_report: {
    name?: string;
    month: string;
    earnings: string;
    referrals: number;
    volume: string;
  };
};

async function build<T extends keyof Payloads>(
  type: T,
  data: Payloads[T]
): Promise<{ subject: string; html: string }> {
  const dashboardUrl = `${getSiteUrl()}/dashboard`;

  switch (type) {
    case "welcome": {
      const d = data as Payloads["welcome"];
      return {
        subject: "أهلاً بك في FX Partners",
        html: await render(createElement(WelcomeEmail, { ...d, dashboardUrl })),
      };
    }
    case "withdrawal_requested": {
      const d = data as Payloads["withdrawal_requested"];
      return {
        subject: `تم استلام طلب السحب (${d.amount})`,
        html: await render(
          createElement(WithdrawalRequestedEmail, { ...d, dashboardUrl })
        ),
      };
    }
    case "monthly_report": {
      const d = data as Payloads["monthly_report"];
      return {
        subject: `تقرير أرباحك — ${d.month}`,
        html: await render(
          createElement(MonthlyReportEmail, { ...d, dashboardUrl })
        ),
      };
    }
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}

/**
 * Render a branded partner email and send it via the Supabase Edge Function
 * `send-email` (which calls Resend). Best-effort: never throws to the caller.
 */
export async function sendPartnerEmail<T extends keyof Payloads>(
  type: T,
  to: string,
  data: Payloads[T]
): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
  try {
    const { subject, html } = await build(type, data);
    const { error } = await invokeSend(to, subject, html);
    if (error) console.error("send-email invoke error:", error.message);
  } catch (err) {
    console.error("sendPartnerEmail failed:", err);
  }
}

/**
 * Send a pre-rendered email (subject + HTML) without a React template.
 * Used for one-off transactional messages such as booking confirmations.
 * Best-effort: never throws to the caller.
 */
export async function sendRawEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
  try {
    const { error } = await invokeSend(to, subject, html);
    if (error) console.error("send-email invoke error:", error.message);
  } catch (err) {
    console.error("sendRawEmail failed:", err);
  }
}

/**
 * Invoke the `send-email` edge function. Uses the service-role key when
 * available (works with no user session — e.g. a database-trigger hook),
 * otherwise the request-scoped user client (e.g. a signed-in action).
 */
async function invokeSend(to: string, subject: string, html: string) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    const { createClient: createAdminClient } = await import(
      "@supabase/supabase-js"
    );
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey
    );
    return admin.functions.invoke("send-email", { body: { to, subject, html } });
  }
  const supabase = createClient();
  return supabase.functions.invoke("send-email", { body: { to, subject, html } });
}
