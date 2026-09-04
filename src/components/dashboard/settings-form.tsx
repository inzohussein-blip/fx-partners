"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { profileSchema, type ProfileValues } from "@/lib/validators";
import { updateProfile } from "@/lib/actions/settings";

export function SettingsForm({
  profile,
}: {
  profile: ProfileValues & { email?: string; ib_code?: string | null };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [ok, setOk] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name ?? "",
      company_name: profile.company_name ?? "",
      country: profile.country ?? "",
      phone: profile.phone ?? "",
    },
  });

  function onSubmit(values: ProfileValues) {
    setOk(false);
    setServerError(null);
    startTransition(async () => {
      const res = await updateProfile(values);
      if (!res.ok) setServerError(res.error ?? "فشل الحفظ");
      else {
        setOk(true);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-surface p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="الاسم الكامل" error={errors.full_name?.message}>
          <input {...register("full_name")} className={inputCls} />
        </Field>
        <Field label="اسم الشركة" error={errors.company_name?.message}>
          <input {...register("company_name")} className={inputCls} />
        </Field>
        <Field label="الدولة" error={errors.country?.message}>
          <input {...register("country")} className={inputCls} />
        </Field>
        <Field label="رقم الهاتف" error={errors.phone?.message}>
          <input {...register("phone")} dir="ltr" className={inputCls} />
        </Field>

        <Field label="البريد الإلكتروني (غير قابل للتعديل)">
          <input
            value={profile.email ?? ""}
            disabled
            dir="ltr"
            className={`${inputCls} cursor-not-allowed opacity-60`}
          />
        </Field>
        {profile.ib_code && (
          <Field label="كود الوكيل">
            <input
              value={profile.ib_code}
              disabled
              dir="ltr"
              className={`${inputCls} cursor-not-allowed font-mono opacity-60`}
            />
          </Field>
        )}
      </div>

      {serverError && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {serverError}
        </p>
      )}
      {ok && (
        <p className="mt-4 rounded-lg bg-brand-500/10 px-3 py-2 text-sm text-brand-200">
          تم حفظ التغييرات.
        </p>
      )}

      <div className="mt-5">
        <Button type="submit" disabled={pending}>
          {pending ? "جارٍ الحفظ…" : "حفظ التغييرات"}
        </Button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-slate-300">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-300">{error}</span>}
    </label>
  );
}
