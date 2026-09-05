"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Pencil, Check } from "lucide-react";

type Ctx = { isAdmin: boolean; editMode: boolean };
const AdminEditContext = createContext<Ctx>({ isAdmin: false, editMode: false });

export function useAdminEdit() {
  return useContext(AdminEditContext);
}

const KEY = "fxp_edit_mode";

/**
 * Provides admin edit state to the marketing pages and renders a floating
 * toggle (only for admins) that turns on-page inline editing on/off.
 */
export function AdminEditProvider({
  isAdmin,
  children,
}: {
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  const [editMode, setEditMode] = useState(false);

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
