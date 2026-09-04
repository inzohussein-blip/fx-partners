"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
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
    <div className="hero-glow flex min-h-screen items-center justify-center py-12">
      <Container className="max-w-md">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo markClassName="h-9 w-9" />
        </Link>

        <div className="card-surface p-8">
          <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
          <p className="mt-2 text-sm text-slate-400">{t("subtitle")}</p>

          {sent ? (
            <p className="mt-6 rounded-lg bg-brand-500/10 px-3 py-3 text-sm text-brand-200">
              {t("sent")}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-300">
                  {t("email")}
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  dir="ltr"
                  className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </label>

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
        </div>
      </Container>
    </div>
  );
}
