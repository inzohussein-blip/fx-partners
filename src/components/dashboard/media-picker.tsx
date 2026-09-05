"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadToMedia } from "@/lib/upload";
import { Dialog } from "@/components/ui/dialog";
import { ImagePlus, Upload, Loader2, Images } from "lucide-react";

type MediaItem = { name: string; url: string };

/**
 * Button that opens a media dialog: pick an existing image from the `media`
 * bucket, or upload a new one. Calls onSelect with the chosen public URL.
 */
export function MediaPicker({
  onSelect,
  label = "اختر أو ارفع صورة",
}: {
  onSelect: (url: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.storage.from("media").list("", {
        limit: 200,
        sortBy: { column: "created_at", order: "desc" },
      });
      setItems(
        (data ?? [])
          .filter((f) => f.name && !f.name.startsWith("."))
          .map((f) => ({
            name: f.name,
            url: supabase.storage.from("media").getPublicUrl(f.name).data.publicUrl,
          }))
      );
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  function openDialog() {
    setOpen(true);
    setError(null);
    load();
  }

  function pick(url: string) {
    onSelect(url);
    setOpen(false);
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadToMedia(file);
      pick(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر رفع الصورة");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
      >
        <ImagePlus className="h-3.5 w-3.5" />
        {label}
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="معرض الوسائط"
        description="اختر صورة موجودة أو ارفع جديدة."
        footer={
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:opacity-90">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            رفع صورة جديدة
            <input type="file" accept="image/*" hidden onChange={onUpload} disabled={uploading} />
          </label>
        }
      >
        {error && <p className="mb-3 text-sm text-red-300">{error}</p>}
        {loading ? (
          <div className="grid place-items-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Images className="h-8 w-8 text-slate-600" aria-hidden />
            <p className="mt-3 text-sm text-slate-500">لا توجد صور بعد — ارفع أول صورة.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {items.map((m) => (
              <button
                key={m.name}
                type="button"
                onClick={() => pick(m.url)}
                className="group overflow-hidden rounded-xl border border-white/10 transition hover:ring-2 hover:ring-brand-500/50"
                title={m.name}
              >
                <span className="block aspect-square bg-ink-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.name} loading="lazy" decoding="async" className="h-full w-full object-contain" />
                </span>
              </button>
            ))}
          </div>
        )}
      </Dialog>
    </>
  );
}
