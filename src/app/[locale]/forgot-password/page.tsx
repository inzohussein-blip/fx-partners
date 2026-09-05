"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { Field } from "@/components/auth/field";
import { authSchema } from "@/lib/validators";

export default function ForgotPasswordPage() {
  const t = useTranslations("Forgot");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const check = authSchema.shape.email.safeParse(email);
    if (!check.success) {
      setError(t("invalidEmail"));
      return;
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setError("Supabase is not configured yet.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
      <p className="mt-2 text-sm text-slate-400">{t("subtitle")}</p>

      {sent ? (
        <p className="mt-6 rounded-lg bg-brand-500/10 px-3 py-3 text-sm text-brand-200">
          {t("sent")}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field
            label={t("email")}
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            dir="ltr"
          />

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("sending") : t("send")}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-400">
        <Link href="/login" className="font-semibold text-brand-300 hover:text-brand-200">
          {t("backToLogin")}
        </Link>
      </p>
    </AuthShell>
  );
}
