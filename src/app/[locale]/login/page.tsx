"use client";

import { Suspense, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { Field } from "@/components/auth/field";
import { GoogleButton } from "@/components/auth/google-button";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const t = useTranslations("Login");
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/dashboard";

  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setError(t("notConfigured"));
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(redirect);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage(t("signUpSuccess"));
        toast.success(t("signUpSuccess"));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("genericError");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
          <h1 className="text-2xl font-bold text-white">
            {mode === "sign-in" ? t("signInTitle") : t("signUpTitle")}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {mode === "sign-in" ? t("signInSubtitle") : t("signUpSubtitle")}
          </p>

          <div className="mt-6">
            <GoogleButton
              label={mode === "sign-in" ? t("googleSignIn") : t("googleSignUp")}
              next={redirect}
            />
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
            <span className="h-px flex-1 bg-white/10" />
            {t("orDivider")}
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "sign-up" && (
              <Field
                label={t("fullName")}
                type="text"
                value={fullName}
                onChange={setFullName}
                placeholder={t("fullNamePlaceholder")}
              />
            )}
            <Field
              label={t("email")}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              required
            />
            <Field
              label={t("password")}
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
            />

            {error && (
              <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="rounded-lg bg-brand-500/10 px-3 py-2 text-sm text-brand-200">
                {message}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading
                ? t("processing")
                : mode === "sign-in"
                  ? t("signInAction")
                  : t("signUpAction")}
            </Button>
          </form>

          {mode === "sign-in" && (
            <p className="mt-4 text-center text-sm">
              <Link href="/forgot-password" className="text-slate-400 hover:text-brand-200">
                {t("forgot")}
              </Link>
            </p>
          )}

          <p className="mt-6 text-center text-sm text-slate-400">
            {mode === "sign-in" ? t("noAccount") : t("hasAccount")}{" "}
            <button
              onClick={() => {
                setMode(mode === "sign-in" ? "sign-up" : "sign-in");
                setError(null);
                setMessage(null);
              }}
              className="font-semibold text-brand-300 hover:text-brand-200"
            >
              {mode === "sign-in" ? t("createOne") : t("signInLink")}
            </button>
          </p>
    </AuthShell>
  );
}
