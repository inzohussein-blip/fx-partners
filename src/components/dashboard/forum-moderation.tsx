"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  setChannelStatus,
  deleteChannel,
  hideComment,
  deleteComment,
} from "@/lib/actions/forum";
import { Avatar, formatForumDate } from "@/components/forum/avatar";
import type { Channel, AdminComment } from "@/lib/forum";
import {
  BadgeCheck,
  Radio,
  Check,
  Ban,
  Trash2,
  EyeOff,
  Eye,
  ExternalLink,
  Clock,
} from "lucide-react";

const badge: Record<string, { text: string; cls: string }> = {
  active: { text: "نشطة", cls: "bg-brand-500/10 text-brand-300" },
  pending: { text: "قيد المراجعة", cls: "bg-gold-500/10 text-gold-400" },
  banned: { text: "محظورة", cls: "bg-red-500/10 text-red-300" },
};

export function ForumModeration({
  channels,
  comments,
}: {
  channels: Channel[];
  comments: AdminComment[];
}) {
  return (
    <div className="space-y-8">
      <ChannelsTable channels={channels} />
      <CommentsTable comments={comments} />
    </div>
  );
}

function ChannelsTable({ channels }: { channels: Channel[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function act(fn: () => Promise<unknown>) {
    start(async () => {
      await fn();
      router.refresh();
    });
  }

  const pendingCount = channels.filter((c) => c.status === "pending").length;

  return (
    <section className="card-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">القنوات</h2>
        {pendingCount > 0 && (
          <span className="rounded-md bg-gold-500/10 px-2 py-1 text-xs text-gold-400">
            {pendingCount} بانتظار الاعتماد
          </span>
        )}
      </div>

      {channels.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">لا توجد قنوات بعد.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-right text-sm">
            <thead>
              <tr className="border-b border-white/5 text-slate-400">
                <th className="pb-3 font-medium">القناة</th>
                <th className="pb-3 font-medium">النوع</th>
                <th className="pb-3 font-medium">المالك</th>
                <th className="pb-3 font-medium">المنشورات</th>
                <th className="pb-3 font-medium">الحالة</th>
                <th className="pb-3 font-medium">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {channels.map((c) => {
                const b = badge[c.status] ?? badge.pending;
                return (
                  <tr key={c.id} className="text-slate-300">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={c.owner_name || c.name} src={c.cover_image} size={30} />
                        <span className="font-medium text-white">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      {c.kind === "official" ? (
                        <span className="inline-flex items-center gap-1 text-brand-300">
                          <BadgeCheck className="h-3.5 w-3.5" /> رسمية
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gold-400">
                          <Radio className="h-3.5 w-3.5" /> وكيل
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-xs text-slate-500">{c.owner_name || "—"}</td>
                    <td className="py-3">{c.post_count ?? 0}</td>
                    <td className="py-3">
                      <span className={`rounded-md px-2 py-1 text-xs ${b.cls}`}>{b.text}</span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        {c.status !== "active" && (
                          <button
                            type="button"
                            onClick={() => act(() => setChannelStatus(c.id, "active"))}
                            disabled={pending}
                            title="اعتماد"
                            className="rounded-lg bg-brand-500/10 p-2 text-brand-300 hover:bg-brand-500/20 disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {c.status !== "banned" && (
                          <button
                            type="button"
                            onClick={() => act(() => setChannelStatus(c.id, "banned"))}
                            disabled={pending}
                            title="حظر"
                            className="rounded-lg bg-gold-500/10 p-2 text-gold-400 hover:bg-gold-500/20 disabled:opacity-50"
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {c.status === "active" && (
                          <Link
                            href={`/forum/${c.slug}`}
                            title="عرض"
                            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("حذف القناة وكل منشوراتها نهائياً؟"))
                              act(() => deleteChannel(c.id));
                          }}
                          disabled={pending}
                          title="حذف"
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function CommentsTable({ comments }: { comments: AdminComment[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function act(fn: () => Promise<unknown>) {
    start(async () => {
      await fn();
      router.refresh();
    });
  }

  return (
    <section className="card-surface p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
        <Clock className="h-4 w-4 text-slate-400" /> أحدث التعليقات
      </h2>
      {comments.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">لا توجد تعليقات بعد.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 ${
                c.is_hidden ? "border-red-500/20 bg-red-500/5" : "border-white/5 bg-ink-900/40"
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-200">{c.author_name || "عضو"}</span>
                  <span>·</span>
                  <time>{formatForumDate(c.created_at)}</time>
                  {c.is_hidden && (
                    <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-red-300">مخفي</span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-300">{c.body}</p>
                {c.post?.channel?.slug && (
                  <Link
                    href={`/forum/${c.post.channel.slug}/${c.post.slug}#comments`}
                    className="mt-1 inline-block text-xs text-brand-300 hover:text-brand-200"
                  >
                    على: {c.post.title}
                  </Link>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => act(() => hideComment(c.id, !c.is_hidden))}
                  disabled={pending}
                  title={c.is_hidden ? "إظهار" : "إخفاء"}
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  {c.is_hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("حذف هذا التعليق؟")) act(() => deleteComment(c.id));
                  }}
                  disabled={pending}
                  title="حذف"
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
