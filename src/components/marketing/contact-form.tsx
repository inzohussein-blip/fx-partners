"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { sendContactMessage } from "@/lib/actions/contact";
import { Loader2, Check, Send } from "lucide-react";

type Values = { name: string; email: string; subject: string; message: string };

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(values: Values) {
    setError(null);
    const res = await sendContactMessage(values);
    if (res.ok) {
      setDone(true);
      reset();
    } else {
      setError(res.error ?? "تعذّر الإرسال.");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

  if (done) {
    return (
      <div className="card-surface p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-500/15 text-brand-300">
          <Check className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-lg font-bold text-white">تم إرسال رسالتك!</h3>
        <p className="mt-2 text-sm text-slate-400">
          شكراً لتواصلك، سيرد عليك فريقنا في أقرب وقت.
        </p>
        <button
          onClick={() => setDone(false)}
          className="mt-4 text-sm text-brand-300 hover:text-brand-200"
        >
          إرسال رسالة أخرى
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-surface space-y-4 p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="mb-1.5 block text-sm text-slate-300">
            الاسم
          </label>
          <input
            id="c-name"
            className={inputCls}
            aria-invalid={!!errors.name}
            {...register("name", { required: "الاسم مطلوب" })}
          />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="c-email" className="mb-1.5 block text-sm text-slate-300">
            البريد الإلكتروني
          </label>
          <input
            id="c-email"
            type="email"
            dir="ltr"
            className={inputCls}
            aria-invalid={!!errors.email}
            {...register("email", {
              required: "البريد مطلوب",
              pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "بريد غير صالح" },
            })}
          />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="c-subject" className="mb-1.5 block text-sm text-slate-300">
          الموضوع <span className="text-slate-600">(اختياري)</span>
        </label>
        <input id="c-subject" className={inputCls} {...register("subject")} />
      </div>

      <div>
        <label htmlFor="c-message" className="mb-1.5 block text-sm text-slate-300">
          الرسالة
        </label>
        <textarea
          id="c-message"
          rows={5}
          className={inputCls}
          aria-invalid={!!errors.message}
          {...register("message", { required: "الرسالة مطلوبة" })}
        />
        {errors.message && (
          <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> جارٍ الإرسال…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> إرسال الرسالة
          </>
        )}
      </button>
    </form>
  );
}
