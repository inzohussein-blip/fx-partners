"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/dashboard/media-picker";
import { ForumPostForm } from "@/components/dashboard/forum-post-form";
import {
  createChannel,
  updateChannel,
  deleteChannel,
  deleteForumPost,
  type ChannelInput,
} from "@/lib/actions/forum";
import type { Channel, ForumPost } from "@/lib/forum";
import {
  Plus,
  Radio,
  BadgeCheck,
  Pencil,
  Trash2,
  ExternalLink,
  Clock,
  Ban,
} from "lucide-react";

const statusBadge: Record<string, { text: string; cls: string; icon: typeof Clock }> = {
  active: { text: "نشطة", cls: "bg-brand-500/10 text-brand-300", icon: BadgeCheck },
  pending: { text: "بانتظار الاعتماد", cls: "bg-gold-500/10 text-gold-400", icon: Clock },
  banned: { text: "محظورة", cls: "bg-red-500/10 text-red-300", icon: Ban },
};

export function ForumManager({
  channels,
  postsByChannel,
  canCreate,
}: {
  channels: Channel[];
  postsByChannel: Record<string, ForumPost[]>;
  canCreate: boolean;
}) {
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      {canCreate && (
        <div>
          {creating ? (
            <ChannelForm onDone={() => setCreating(false)} />
          ) : (
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> إنشاء قناة جديدة
            </Button>
          )}
        </div>
      )}

      {channels.length === 0 && !creating && (
        <div className="card-surface flex flex-col items-center px-6 py-14 text-center">
          <Radio className="h-8 w-8 text-slate-600" />
          <p className="mt-3 text-sm text-slate-500">
            {canCreate
              ? "لا توجد قنوات بعد — أنشئ قناتك الأولى وابدأ بنشر تحليلاتك."
              : "إنشاء القنوات متاح للوكلاء المعتمدين فقط."}
          </p>
        </div>
      )}

      {channels.map((channel) => (
        <ChannelBlock
          key={channel.id}
          channel={channel}
          posts={postsByChannel[channel.id] ?? []}
        />
      ))}
    </div>
  );
}

function ChannelBlock({ channel, posts }: { channel: Channel; posts: ForumPost[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [posting, setPosting] = useState(false);
  const [editPost, setEditPost] = useState<ForumPost | null>(null);
  const [pending, start] = useTransition();

  const badge = statusBadge[channel.status] ?? statusBadge.pending;
  const BadgeIcon = badge.icon;

  function removeChannel() {
    if (!confirm("حذف هذه القناة وكل منشوراتها؟")) return;
    start(async () => {
      await deleteChannel(channel.id);
      router.refresh();
    });
  }

  function removePost(id: string) {
    if (!confirm("حذف هذا المنشور؟")) return;
    start(async () => {
      await deleteForumPost(id);
      router.refresh();
    });
  }

  return (
    <div className="card-surface p-6">
      {editing ? (
        <ChannelForm channel={channel} onDone={() => setEditing(false)} />
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{channel.name}</h3>
              <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs ${badge.cls}`}>
                <BadgeIcon className="h-3 w-3" /> {badge.text}
              </span>
            </div>
            {channel.description && (
              <p className="mt-1 line-clamp-2 max-w-xl text-sm text-slate-400">
                {channel.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {channel.status === "active" && (
              <Link
                href={`/forum/${channel.slug}`}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white"
              >
                <ExternalLink className="h-3.5 w-3.5" /> عرض
              </Link>
            )}
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <Pencil className="h-3.5 w-3.5" /> تعديل
            </button>
            <button
              type="button"
              onClick={removeChannel}
              disabled={pending}
              className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> حذف
            </button>
          </div>
        </div>
      )}

      {channel.status === "pending" && (
        <p className="mt-4 rounded-lg bg-gold-500/5 px-3 py-2 text-xs text-gold-300/90">
          قناتك قيد المراجعة من الإدارة. يمكنك تجهيز المنشورات الآن وستظهر عند اعتماد القناة.
        </p>
      )}

      {/* Posts */}
      <div className="mt-5 border-t border-white/5 pt-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-200">
            المنشورات ({posts.length})
          </h4>
          {!posting && !editPost && (
            <button
              type="button"
              onClick={() => setPosting(true)}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-300 hover:text-brand-200"
            >
              <Plus className="h-4 w-4" /> منشور جديد
            </button>
          )}
        </div>

        {posting && (
          <div className="mt-4">
            <ForumPostForm channelId={channel.id} onDone={() => setPosting(false)} />
          </div>
        )}
        {editPost && (
          <div className="mt-4">
            <ForumPostForm
              channelId={channel.id}
              post={editPost}
              onDone={() => setEditPost(null)}
            />
          </div>
        )}

        <div className="mt-4 space-y-2">
          {posts.length === 0 && !posting && (
            <p className="text-sm text-slate-500">لا توجد منشورات بعد.</p>
          )}
          {posts.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-ink-900/40 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-white">{p.title}</span>
                  {p.status === "draft" && (
                    <span className="rounded bg-gold-500/10 px-1.5 py-0.5 text-[10px] text-gold-400">
                      مسودة
                    </span>
                  )}
                  {p.is_pinned && (
                    <span className="rounded bg-brand-500/10 px-1.5 py-0.5 text-[10px] text-brand-300">
                      مثبّت
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {p.reaction_count ?? 0} إعجاب · {p.comment_count ?? 0} تعليق · {p.views} مشاهدة
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setPosting(false);
                    setEditPost(p);
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                  aria-label="تعديل"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removePost(p.id)}
                  disabled={pending}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                  aria-label="حذف"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChannelForm({ channel, onDone }: { channel?: Channel; onDone: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ChannelInput>({
    id: channel?.id,
    name: channel?.name ?? "",
    description: channel?.description ?? "",
    cover_image: channel?.cover_image ?? "",
  });

  function set<K extends keyof ChannelInput>(k: K, v: ChannelInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = channel ? await updateChannel(form) : await createChannel(form);
      if (!res.ok) {
        setError(res.error ?? "فشل الحفظ");
        return;
      }
      onDone();
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-brand-500/20 bg-ink-900/40 p-5">
      <h3 className="font-semibold text-white">
        {channel ? "تعديل القناة" : "إنشاء قناة جديدة"}
      </h3>
      <label className="block">
        <span className="mb-1.5 block text-sm text-slate-300">اسم القناة</span>
        <input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
          placeholder="مثال: توصيات الذهب اليومية"
          className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm text-slate-300">الوصف</span>
        <textarea
          value={form.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white focus:border-brand-500/50 focus:outline-none"
        />
      </label>
      <div>
        <span className="mb-1.5 block text-sm text-slate-300">صورة القناة</span>
        <div className="flex items-center gap-3">
          <MediaPicker onSelect={(url) => set("cover_image", url)} label="اختر أو ارفع صورة" />
          {form.cover_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.cover_image} alt="" className="h-10 w-10 rounded-full border border-white/10 object-cover" />
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "جارٍ الحفظ…" : channel ? "حفظ" : "إنشاء"}
        </Button>
        <button type="button" onClick={onDone} className="text-sm text-slate-400 hover:text-white">
          إلغاء
        </button>
        {error && <span className="text-sm text-red-300">{error}</span>}
      </div>
    </form>
  );
}
