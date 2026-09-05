"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { savePost, deletePost, type PostInput } from "@/lib/actions/admin";
import { RichEditor } from "@/components/dashboard/rich-editor";
import { MediaUploadButton } from "@/components/dashboard/media-upload-button";
import { Trash2 } from "lucide-react";

const statuses: { value: PostInput["status"]; label: string }[] = [
  { value: "draft", label: "مسودة" },
  { value: "published", label: "منشور" },
  { value: "archived", label: "مؤرشف" },
];

export function PostEditor({ post }: { post?: PostInput }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<PostInput>({
    id: post?.id,
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    body: post?.body ?? "",
    cover_image: post?.cover_image ?? "",
    status: post?.status ?? "draft",
  });

  function set<K extends keyof PostInput>(key: K, value: PostInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await savePost(form);
      if (!res.ok) setError(res.error ?? "فشل الحفظ");
      else router.push("/dashboard/admin/posts");
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="card-surface space-y-4 p-6">
        <Text label="العنوان" value={form.title} onChange={(v) => set("title", v)} required />
        <Text
          label="الرابط (Slug) — اتركه فارغاً للتوليد التلقائي"
          value={form.slug ?? ""}
          onChange={(v) => set("slug", v)}
          placeholder="my-post-slug"
          mono
        />
        <Text
          label="مقتطف"
          value={form.excerpt ?? ""}
          onChange={(v) => set("excerpt", v)}
        />
        <div>
          <Text
            label="رابط صورة الغلاف"
            value={form.cover_image ?? ""}
            onChange={(v) => set("cover_image", v)}
            placeholder="https://…"
            mono
          />
          <div className="mt-2 flex items-center gap-3">
            <MediaUploadButton onUploaded={(url) => set("cover_image", url)} label="رفع صورة الغلاف" />
            {form.cover_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.cover_image} alt="" className="h-10 w-16 rounded-lg border border-white/10 object-cover" />
            )}
          </div>
        </div>

        <div className="block">
          <span className="mb-1.5 block text-sm text-slate-300">المحتوى</span>
          <RichEditor value={form.body ?? ""} onChange={(html) => set("body", html)} />
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-300">الحالة</span>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value as PostInput["status"])}
            className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white focus:border-brand-500/50 focus:outline-none sm:w-48"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "جارٍ الحفظ…" : "حفظ"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/dashboard/admin/posts")}
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
}

export function DeletePostButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handle() {
    if (!confirm("حذف هذا المنشور نهائياً؟")) return;
    startTransition(async () => {
      await deletePost(id);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={pending}
      className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
      حذف
    </button>
  );
}

function Text({
  label,
  value,
  onChange,
  placeholder,
  required,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-slate-300">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none ${
          mono ? "font-mono text-sm" : ""
        }`}
      />
    </label>
  );
}
