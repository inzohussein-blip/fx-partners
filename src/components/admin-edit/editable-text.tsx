"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminEdit } from "@/components/admin-edit/provider";
import { Dialog } from "@/components/ui/dialog";
import { saveContentField } from "@/lib/actions/admin";
import { Pencil, Loader2, Check } from "lucide-react";

/**
 * Wraps a piece of server-rendered site copy. For admins with edit mode on,
 * a pencil appears; clicking opens a dialog to edit just this content field,
 * which merges into the site_content block and refreshes the live page.
 */
export function EditableText({
  contentKey,
  field,
  label,
  multiline,
  children,
}: {
  contentKey: string;
  field: string;
  label?: string;
  multiline?: boolean;
  children: React.ReactNode;
}) {
  const { isAdmin, editMode } = useAdminEdit();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAdmin || !editMode) return <>{children}</>;

  function start() {
    setValue(typeof children === "string" ? children : String(children ?? ""));
    setError(null);
    setOpen(true);
  }

  async function save() {
    setBusy(true);
    setError(null);
    const res = await saveContentField(contentKey, field, value);
    setBusy(false);
    if (!res.ok) return setError(res.error ?? "تعذّر الحفظ");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <span className="relative inline rounded outline-dashed outline-1 outline-brand-500/40">
        {children}
        <button
          onClick={start}
          className="absolute -top-2.5 -end-2.5 z-10 grid h-6 w-6 place-items-center rounded-full bg-brand-gradient text-white shadow-glow"
          aria-label={`تعديل ${label ?? field}`}
        >
          <Pencil className="h-3 w-3" />
        </button>
      </span>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`تعديل: ${label ?? field}`}
        footer={
          <>
            <button
              onClick={() => setOpen(false)}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5"
            >
              إلغاء
            </button>
            <button
              onClick={save}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              حفظ
            </button>
          </>
        }
      >
        {multiline ? (
          <textarea
            rows={4}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            dir="auto"
            className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 text-white focus:border-brand-500/50 focus:outline-none"
          />
        ) : (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            dir="auto"
            className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 text-white focus:border-brand-500/50 focus:outline-none"
          />
        )}
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      </Dialog>
    </>
  );
}
