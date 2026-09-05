"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Pencil, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Ctx = { isAdmin: boolean; editMode: boolean };
const AdminEditContext = createContext<Ctx>({ isAdmin: false, editMode: false });

export function useAdminEdit() {
  return useContext(AdminEditContext);
}

const KEY = "fxp_edit_mode";

/**
 * Provides admin edit state to the marketing pages and renders a floating
 * toggle (only for admins) that turns on-page inline editing on/off.
 *
 * Admin status is resolved on the client (after hydration) so the public
 * marketing pages stay statically rendered — the shared server layout no
 * longer reads auth cookies on every request. RLS lets a signed-in user read
 * only their own profile row, so this discloses nothing to anonymous visitors.
 */
export function AdminEditProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Detect admin client-side; only signed-in admins ever see edit affordances.
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        if (!cancelled) setIsAdmin(profile?.role === "admin");
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Remember the toggle across navigations (per session).
  useEffect(() => {
    if (!isAdmin) return;
    try {
      setEditMode(sessionStorage.getItem(KEY) === "1");
    } catch {
      /* ignore */
    }
  }, [isAdmin]);

  function toggle() {
    setEditMode((v) => {
      const next = !v;
      try {
        sessionStorage.setItem(KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <AdminEditContext.Provider value={{ isAdmin, editMode }}>
      {children}
      {isAdmin && (
        <button
          onClick={toggle}
          className={`fixed bottom-5 end-5 z-[60] inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-glow transition ${
            editMode
              ? "bg-brand-gradient text-white"
              : "border border-white/15 bg-ink-800/90 text-slate-200 backdrop-blur hover:bg-ink-700"
          }`}
          aria-pressed={editMode}
        >
          {editMode ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          {editMode ? "وضع التحرير مُفعّل" : "تحرير الصفحة"}
        </button>
      )}
    </AdminEditContext.Provider>
  );
}
