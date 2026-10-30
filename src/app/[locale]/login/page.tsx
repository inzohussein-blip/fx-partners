"use client";

import { Suspense, useState, use } from "react";
import { safeInternalPath } from "@/lib/safe-redirect";
import { authErrorKey, callbackReason } from "@/lib/auth-errors";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { Field } from "@/components/auth/field";
import { GoogleButton } from "@/components/auth/google-button";

export default function LoginPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = use(props.params);

  const {
    locale
  } = params;

  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const t = useTranslations("Login");
  const te = useTranslations("AuthErrors");
  const router = useRouter();
  const params = useSearchParams();
  const redirect = safeInternalPath(params.get("redirect"));
  // A failed confirmation / OAuth / recovery link lands here with a reason.
  const fromCallback = callbackReason(params.get("error"));

  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(fromCallback ? te(fromCallback) : null);
  // Shown with the error when the account exists but is not confirmed yet.
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  const confirmUrl = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`;

  function fail(err: unknown) {
    const key = authErrorKey(err);
    setError(te(key));
    setCanResend(key === "emailNotConfirmed");
    toast.error(te(key));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setCanResend(false);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setError(t("notConfigured"));
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) return fail(error);
        router.push(redirect);
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: confirmUrl(),
          },
        });
        if (error) return fail(error);
        // Email confirmation off: the session is live, go straight in.
        if (data.session) {
          router.push(redirect);
          router.refresh();
          return;
        }
        // An already-registered email comes back with no error and no
        // identities (Supabase hides which emails exist); no email is sent.
        if (data.user && (data.user.identities?.length ?? 0) === 0) {
          return fail({ code: "user_already_exists" });
        }
        const msg = te("checkEmail", { email: email.trim() });
        setMessage(msg);
        setCanResend(true);
        toast.success(msg);
      }
    } catch (err) {
      fail(err);
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (!email.trim()) return;
    setResending(true);
    const { error } = await createClient().auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: confirmUrl() },
    });
    setResending(false);
    if (error) return fail(error);
    setError(null);
    setMessage(te("resent"));
    toast.success(te("resent"));
  }

  return (
    <AuthShell>
          <h1 className="text-2xl font-bold text-fg">
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
            <span className="h-px flex-1 bg-fg/10" />
            {t("orDivider")}
            <span className="h-px flex-1 bg-fg/10" />
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
            {canResend && email.trim() && (
              <button
                type="button"
                onClick={resend}
                disabled={resending}
                className="text-sm font-semibold text-brand-300 underline underline-offset-4 hover:text-brand-200 disabled:opacity-60"
              >
                {resending ? te("resending") : te("resend")}
              </button>
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
                setCanResend(false);
              }}
              className="font-semibold text-brand-300 hover:text-brand-200"
            >
              {mode === "sign-in" ? t("createOne") : t("signInLink")}
            </button>
          </p>
    </AuthShell>
  );
}
