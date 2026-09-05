"use client";

import { useRef, useState } from "react";
import { uploadToMedia } from "@/lib/upload";
import { Upload, Loader2 } from "lucide-react";

/** Small button that uploads an image to the media bucket and returns its URL. */
export function MediaUploadButton({
  onUploaded,
  label = "رفع صورة",
}: {
  onUploaded: (url: string) => void;
  label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      onUploaded(await uploadToMedia(file));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "تعذّر رفع الصورة");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        {label}
      </button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={onPick} />
    </>
  );
}
