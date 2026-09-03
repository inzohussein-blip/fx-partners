"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validators";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(values: ResetPasswordValues) {
    setServerError(null);
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setServerError("لم يتم إعداد Supabase بعد.");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setServerError(
        "تعذّر تحديث كلمة المرور. افتح الرابط من بريدك مجدداً ثم حاول."
      );
      return;
    }
    setOk(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1200);
  }

  return (
    <div className="hero-glow flex min-h-screen items-center justify-center py-12">
      <Container className="max-w-md">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo markClassName="h-9 w-9" />
        </Link>

        <div className="card-surface p-8">
          <h1 className="text-2xl font-bold text-white">تعيين كلمة مرور جديدة</h1>
          <p className="mt-2 text-sm text-slate-400">
            اختر كلمة مرور جديدة لحسابك.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-300">
                كلمة المرور الجديدة
              </span>
              <input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className={inputCls}
              />
              {errors.password && (
                <span className="mt-1 block text-xs text-red-300">
                  {errors.password.message}
                </span>
              )}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-300">
                تأكيد كلمة المرور
              </span>
              <input
                type="password"
                {...register("confirm")}
                placeholder="••••••••"
                className={inputCls}
              />
              {errors.confirm && (
                <span className="mt-1 block text-xs text-red-300">
                  {errors.confirm.message}
                </span>
              )}
            </label>

            {serverError && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {serverError}
              </p>
            )}
            {ok && (
              <p className="rounded-lg bg-brand-500/10 px-3 py-2 text-sm text-brand-200">
                تم تحديث كلمة المرور. جارٍ تحويلك…
              </p>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "جارٍ الحفظ…" : "حفظ كلمة المرور"}
            </Button>
          </form>
        </div>
      </Container>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20";
