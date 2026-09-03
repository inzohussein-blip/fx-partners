"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { saveContent } from "@/app/dashboard/admin/actions";

export type ContentField = { name: string; label: string; multiline?: boolean };

export function ContentEditor({
  blockKey,
  title,
  description,
  fields,
  values,
}: {
  blockKey: string;
  title: string;
  description?: string;
  fields: ContentField[];
  values: Record<string, string>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, values[f.name] ?? ""]))
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setError(null);
    startTransition(async () => {
      const res = await saveContent(blockKey, state);
      if (!res.ok) setError(res.error ?? "فشل الحفظ");
      else {
        setMsg("تم الحفظ");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={submit} className="card-surface p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description && (
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          )}
        </div>
        <code className="rounded bg-white/5 px-2 py-1 text-xs text-slate-500">
          {blockKey}
        </code>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <label
            key={f.name}
            className={`block ${f.multiline ? "sm:col-span-2" : ""}`}
          >
            <span className="mb-1.5 block text-sm text-slate-300">{f.label}</span>
            {f.multiline ? (
              <textarea
                value={state[f.name]}
                onChange={(e) =>
                  setState((s) => ({ ...s, [f.name]: e.target.value }))
                }
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white focus:border-brand-500/50 focus:outline-none"
              />
            ) : (
              <input
                value={state[f.name]}
                onChange={(e) =>
                  setState((s) => ({ ...s, [f.name]: e.target.value }))
                }
                className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white focus:border-brand-500/50 focus:outline-none"
              />
            )}
          </label>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "جارٍ الحفظ…" : "حفظ"}
        </Button>
        {msg && <span className="text-sm text-brand-300">{msg}</span>}
        {error && <span className="text-sm text-red-300">{error}</span>}
      </div>
    </form>
  );
}
