"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_DAYS,
  DENY_ALL,
  effective,
  parse,
  serialise,
  type Category,
  type Consent,
} from "@/lib/consent";

type Ctx = {
  /** What the visitor has allowed. Everything is false until they answer. */
  consent: Consent;
  /** Null until the visitor has made a choice — which is when we ask. */
  answered: boolean;
  /** True once the stored choice has been read, so nothing flashes first. */
  ready: boolean;
  save: (c: Consent) => void;
  /** Reopen the chooser, from the footer link or the cookie policy page. */
  reopen: () => void;
  chooserOpen: boolean;
  closeChooser: () => void;
};

const ConsentContext = createContext<Ctx>({
  consent: DENY_ALL,
  answered: false,
  ready: false,
  save: () => {},
  reopen: () => {},
  chooserOpen: false,
  closeChooser: () => {},
});

export function useConsent() {
  return useContext(ConsentContext);
}

/** Convenience for the common "may I load this?" check. */
export function useAllowed(category: Category): boolean {
  const { consent, ready } = useConsent();
  return ready && consent[category];
}

function readCookie(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(^|;\\s*)${CONSENT_COOKIE}=([^;]*)`));
  return m ? decodeURIComponent(m[2]) : null;
}

function writeCookie(value: string) {
  const maxAge = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
  // No `secure` on localhost, or the cookie is silently dropped in dev.
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax${secure}`;
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<Consent>(DENY_ALL);
  const [answered, setAnswered] = useState(false);
  const [ready, setReady] = useState(false);
  const [chooserOpen, setChooserOpen] = useState(false);

  // Read the stored choice after hydration. Rendering the banner server-side
  // would either leak one visitor's answer into another's cached HTML or make
  // every page dynamic, so the banner is a client-only decision.
  useEffect(() => {
    const stored = parse(readCookie());
    setConsent(effective(stored));
    setAnswered(stored !== null);
    setReady(true);
  }, []);

  const save = useCallback((next: Consent) => {
    writeCookie(serialise(next));
    setConsent(next);
    setAnswered(true);
    setChooserOpen(false);
    // Analytics and embeds decide what to load at mount. Rather than teach
    // every one of them to appear mid-session, reload once so the page is
    // built with the answer — and so that withdrawing consent actually stops
    // a script that is already running, which toggling state cannot do.
    window.location.reload();
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      consent,
      answered,
      ready,
      save,
      reopen: () => setChooserOpen(true),
      chooserOpen,
      closeChooser: () => setChooserOpen(false),
    }),
    [consent, answered, ready, save, chooserOpen]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}
