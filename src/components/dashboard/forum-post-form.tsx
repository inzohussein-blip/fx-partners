"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RichEditor } from "@/components/dashboard/rich-editor";
import { MediaPicker } from "@/components/dashboard/media-picker";
import { saveForumPost, type ForumPostInput } from "@/lib/actions/forum";
import type { ForumPost } from "@/lib/forum";
import { X } from "lucide-react";

/** Create/edit a post inside a channel. `post` present → edit mode. */
export function ForumPostForm({
  channelId,
  post,
  onDone,
}: {
  channelId: string;
  post?: ForumPost;
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ForumPostInput>({
    id: post?.id,
    channel_id: channelId,
    title: post?.title ?? "",
    excerpt: post?.excerpt ?? "",
    body: post?.body ?? "",
    cover_image: post?.cover_image ?? "",
    status: post?.status ?? "published",
    is_pinned: post?.is_pinned ?? false,
  });

  function set<K extends keyof ForumPostInput>(k: K, v: ForumPostInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await saveForumPost(form);
      if (!res.ok) {
        setError(res.error ?? "فشل الحفظ");
        return;
      }
      onDone();
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="card-surface space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">
          {post ? "تعديل المنشور" : "منشور جديد"}
        </h3>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
          aria-label="إغلاق"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm text-slate-300">العنوان</span>
        <input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          required
          className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white focus:border-brand-500/50 focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm text-slate-300">مقتطف قصير</span>
        <input
          value={form.excerpt ?? ""}
          onChange={(e) => set("excerpt", e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white focus:border-brand-500/50 focus:outline-none"
        />
      </label>

      <div>
        <span className="mb-1.5 block text-sm text-slate-300">صورة الغلاف</span>
        <div className="flex items-center gap-3">
          <MediaPicker onSelect={(url) => set("cover_image", url)} label="اختر أو ارفع صورة" />
          {form.cover_image && (
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.cover_image} alt="" className="h-10 w-16 rounded-lg border border-white/10 object-cover" />
              <button
                type="button"
                onClick={() => set("cover_image", "")}
                className="text-xs text-slate-500 hover:text-red-300"
              >
                إزالة
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-sm text-slate-300">المحتوى</span>
        <RichEditor value={form.body ?? ""} onChange={(html) => set("body", html)} />
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-300">الحالة</span>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value as ForumPostInput["status"])}
            className="rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white focus:border-brand-500/50 focus:outline-none"
          >
            <option value="published">منشور</option>
            <option value="draft">مسودة</option>
          </select>
        </label>
        <label className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            checked={form.is_pinned ?? false}
            onChange={(e) => set("is_pinned", e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-ink-900 text-brand-500 focus:ring-brand-500"
          />
          <span className="text-sm text-slate-300">تثبيت أعلى القناة</span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "جارٍ الحفظ…" : post ? "حفظ التعديلات" : "نشر"}
        </Button>
        {error && <span className="text-sm text-red-300">{error}</span>}
      </div>
    </form>
  );
}
