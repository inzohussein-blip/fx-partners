"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MediaUploadButton } from "@/components/dashboard/media-upload-button";
import { deleteMedia } from "@/lib/actions/media";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Copy, Trash2, Loader2, Check, Images } from "lucide-react";
import type { MediaItem } from "@/lib/media";

export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* ignore */
    }
  }

  async function remove(name: string) {
    if (!window.confirm("حذف هذه الصورة نهائياً؟")) return;
    setBusy(name);
    await deleteMedia(name);
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">{items.length} صورة</p>
        <MediaUploadButton onUploaded={() => router.refresh()} label="رفع صورة جديدة" />
      </div>

      {items.length === 0 ? (
        <div className="card-surface">
          <EmptyState
            icon={Images}
            title="لا توجد صور بعد"
            description="ارفع صوراً لإعادة استخدامها في المقالات والشعارات."
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <div key={m.name} className="card-surface group overflow-hidden">
              <div className="relative aspect-video bg-ink-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.name} loading="lazy" decoding="async" className="h-full w-full object-contain" />
              </div>
              <div className="flex items-center justify-between gap-2 p-2.5">
                <span className="truncate text-[11px] text-slate-500" dir="ltr">{m.name}</span>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => copy(m.url)}
                    className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
                    aria-label="نسخ الرابط"
                  >
                    {copied === m.url ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => remove(m.name)}
                    disabled={busy === m.name}
                    className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-red-300"
                    aria-label="حذف"
                  >
                    {busy === m.name ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
