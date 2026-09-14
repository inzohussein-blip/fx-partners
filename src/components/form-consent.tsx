"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * The privacy notice that sits above a form's submit button.
 *
 * Deliberately a notice and not a tick-box for `contact`, `booking` and
 * `public`. Where the basis for processing is answering the request the person
 * just made, a mandatory checkbox is not consent in any meaningful sense —
 * they cannot use the form without it, so it is not freely given — and adding
 * one implies a basis we are not relying on. What the law wants here is that
 * the person is told, before they submit, what happens to what they type. The
 * one place a real checkbox belongs is the broker alert subscription, where
 * consent genuinely is the basis, and that has one.
 *
 * The Telegram relay is named in the contact and booking variants because it
 * is the part nobody would guess: the message goes to a chat app owned by a
 * third party, not just into a database.
 */
export function FormConsent({
  variant,
  className = "",
}: {
  variant: "contact" | "booking" | "public";
  className?: string;
}) {
  const t = useTranslations("FormConsent");
  return (
    <p className={`text-xs leading-relaxed text-slate-500 ${className}`}>
      {t.rich(variant, {
        p: (chunks) => (
          <Link
            href="/privacy"
            className="text-brand-300 underline underline-offset-2 hover:text-brand-200"
          >
            {chunks}
          </Link>
        ),
      })}
    </p>
  );
}
