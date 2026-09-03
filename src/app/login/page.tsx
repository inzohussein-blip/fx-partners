"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
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
      setError("لم يتم إعداد Supabase بعد. أضِف متغيرات البيئة في .env.local");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
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
        setMessage("تم إنشاء الحساب! تحقّق من بريدك لتأكيد التسجيل.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ ما");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hero-glow flex min-h-screen items-center justify-center py-12">
      <Container className="max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 font-bold text-white">
            FX
          </span>
          <span className="text-xl font-bold text-white">Partners</span>
        </Link>

        <div className="card-surface p-8">
          <h1 className="text-2xl font-bold text-white">
            {mode === "sign-in" ? "تسجيل الدخول" : "إنشاء حساب شريك"}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {mode === "sign-in"
              ? "ادخل إلى لوحة الشريك لمتابعة أرباحك."
              : "انضم إلى شبكة شركاء FX Partners."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "sign-up" && (
              <Field
                label="الاسم الكامل"
                type="text"
                value={fullName}
                onChange={setFullName}
                placeholder="اسمك"
              />
            )}
            <Field
              label="البريد الإلكتروني"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              required
            />
            <Field
              label="كلمة المرور"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
            />

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-lg bg-brand-500/10 px-3 py-2 text-sm text-brand-200">
                {message}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading
                ? "جارٍ المعالجة…"
                : mode === "sign-in"
                  ? "دخول"
                  : "إنشاء الحساب"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            {mode === "sign-in" ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}{" "}
            <button
              onClick={() => {
                setMode(mode === "sign-in" ? "sign-up" : "sign-in");
                setError(null);
                setMessage(null);
              }}
              className="font-semibold text-brand-300 hover:text-brand-200"
            >
              {mode === "sign-in" ? "أنشئ حساباً" : "سجّل الدخول"}
            </button>
          </p>
        </div>
      </Container>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
    </label>
  );
}
