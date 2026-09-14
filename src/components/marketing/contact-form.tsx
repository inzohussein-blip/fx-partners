"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { FormConsent } from "@/components/form-consent";
import { sendContactMessage } from "@/lib/actions/contact";
import { Loader2, Check, Send } from "lucide-react";

type Values = {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Honeypot — hidden from people, so only an automated filler touches it. */
  company?: string;
};

export function ContactForm() {
  const t = useTranslations("ContactForm");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // When the form first rendered, so the server can tell a typed message from
  // one submitted in under two seconds.
  const openedAt = useRef(Date.now());

  async function onSubmit(values: Values) {
    setError(null);
    const res = await sendContactMessage({
      ...values,
      elapsed: Date.now() - openedAt.current,
    });
    if (res.ok) {
      setDone(true);
      reset();
    } else {
      setError(res.error ?? t("failed"));
    }
  }

  const inputCls =
    "w-full rounded-xl border border-fg/10 bg-ink-900/60 px-4 py-3 text-fg placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

  if (done) {
    return (
      <div className="card-surface p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-500/15 text-brand-300">
          <Check className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-lg font-bold text-fg">{t("sentTitle")}</h3>
        <p className="mt-2 text-sm text-slate-400">
          {t("sentBody")}
        </p>
        <button
          onClick={() => setDone(false)}
          className="mt-4 text-sm text-brand-300 hover:text-brand-200"
        >
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-surface space-y-4 p-6 sm:p-8">
      {/* Honeypot. Hidden from sight and from screen readers, and excluded
          from tab order, so nobody filling this form in earnest can reach it —
          a value here means the submission was automated. */}
      <div className="hidden" aria-hidden>
        <label htmlFor="c-company">Company</label>
        <input
          id="c-company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("company")}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="mb-1.5 block text-sm text-slate-300">
            {t("name")}
          </label>
          <input
            id="c-name"
            className={inputCls}
            aria-invalid={!!errors.name}
            {...register("name", { required: t("nameRequired") })}
          />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="c-email" className="mb-1.5 block text-sm text-slate-300">
            {t("email")}
          </label>
          <input
            id="c-email"
            type="email"
            dir="ltr"
            className={inputCls}
            aria-invalid={!!errors.email}
            {...register("email", {
              required: t("emailRequired"),
              pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: t("emailInvalid") },
            })}
          />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="c-subject" className="mb-1.5 block text-sm text-slate-300">
          {t("subject")} <span className="text-slate-600">{t("optional")}</span>
        </label>
        <input id="c-subject" className={inputCls} {...register("subject")} />
      </div>

      <div>
        <label htmlFor="c-message" className="mb-1.5 block text-sm text-slate-300">
          {t("message")}
        </label>
        <textarea
          id="c-message"
          rows={5}
          className={inputCls}
          aria-invalid={!!errors.message}
          {...register("message", { required: t("messageRequired") })}
        />
        {errors.message && (
          <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <FormConsent variant="contact" />


      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {t("sending")}
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> {t("send")}
          </>
        )}
      </button>
    </form>
  );
}
