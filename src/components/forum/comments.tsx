"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { addComment, deleteComment, hideComment } from "@/lib/actions/forum";
import { Avatar, formatForumDate } from "@/components/forum/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, CornerDownLeft, Trash2, EyeOff, Eye } from "lucide-react";
import type { ForumComment } from "@/lib/forum";

type Node = ForumComment & { children: Node[] };

function buildTree(list: ForumComment[]): Node[] {
  const byId = new Map<string, Node>();
  list.forEach((c) => byId.set(c.id, { ...c, children: [] }));
  const roots: Node[] = [];
  byId.forEach((n) => {
    if (n.parent_id && byId.has(n.parent_id)) byId.get(n.parent_id)!.children.push(n);
    else roots.push(n);
  });
  return roots;
}

export function Comments({
  postId,
  comments,
  currentUserId,
  isAdmin,
  isAuthed,
}: {
  postId: string;
  comments: ForumComment[];
  currentUserId?: string | null;
  isAdmin: boolean;
  isAuthed: boolean;
}) {
  const tree = useMemo(() => buildTree(comments), [comments]);
  const visible = comments.filter((c) => !c.is_hidden).length;

  return (
    <section className="mt-10" id="comments">
      <h2 className="flex items-center gap-2 text-lg font-bold text-white">
        <MessageCircle className="h-5 w-5 text-brand-300" />
        النقاش ({visible})
      </h2>

      {isAuthed ? (
        <div className="mt-4">
          <CommentForm postId={postId} />
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm text-slate-400">
          <Link href="/login?redirect=/forum" className="font-semibold text-brand-300 hover:text-brand-200">
            سجّل الدخول
          </Link>{" "}
          للمشاركة في النقاش.
        </p>
      )}

      <div className="mt-6 space-y-5">
        {tree.length === 0 && (
          <p className="text-sm text-slate-500">كن أول من يعلّق على هذا المنشور.</p>
        )}
        {tree.map((node) => (
          <CommentNode
            key={node.id}
            node={node}
            postId={postId}
            depth={0}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            isAuthed={isAuthed}
          />
        ))}
      </div>
    </section>
  );
}

function CommentNode({
  node,
  postId,
  depth,
  currentUserId,
  isAdmin,
  isAuthed,
}: {
  node: Node;
  postId: string;
  depth: number;
  currentUserId?: string | null;
  isAdmin: boolean;
  isAuthed: boolean;
}) {
  const router = useRouter();
  const [replying, setReplying] = useState(false);
  const [pending, start] = useTransition();
  const mine = currentUserId && node.author_id === currentUserId;
  const canDelete = mine || isAdmin;

  function onDelete() {
    if (!confirm("حذف هذا التعليق؟")) return;
    start(async () => {
      await deleteComment(node.id);
      router.refresh();
    });
  }
  function onHide() {
    start(async () => {
      await hideComment(node.id, !node.is_hidden);
      router.refresh();
    });
  }

  return (
    <div className={depth > 0 ? "border-r border-white/10 pr-4" : ""}>
      <div className="flex gap-3">
        <Avatar name={node.author_name} src={node.author_avatar} size={34} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-200">{node.author_name || "عضو"}</span>
            <span>·</span>
            <time>{formatForumDate(node.created_at)}</time>
            {node.is_hidden && (
              <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-red-300">مخفي</span>
            )}
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
            {node.body}
          </p>

          <div className="mt-2 flex items-center gap-3 text-xs">
            {isAuthed && depth < 3 && (
              <button
                type="button"
                onClick={() => setReplying((v) => !v)}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-brand-300"
              >
                <CornerDownLeft className="h-3.5 w-3.5" /> رد
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={onHide}
                disabled={pending}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-gold-400"
              >
                {node.is_hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {node.is_hidden ? "إظهار" : "إخفاء"}
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={pending}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" /> حذف
              </button>
            )}
          </div>

          {replying && (
            <div className="mt-3">
              <CommentForm
                postId={postId}
                parentId={node.id}
                onDone={() => setReplying(false)}
                compact
              />
            </div>
          )}
        </div>
      </div>

      {node.children.length > 0 && (
        <div className="mt-4 space-y-4 pr-6">
          {node.children.map((child) => (
            <CommentNode
              key={child.id}
              node={child}
              postId={postId}
              depth={depth + 1}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              isAuthed={isAuthed}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentForm({
  postId,
  parentId,
  onDone,
  compact,
}: {
  postId: string;
  parentId?: string;
  onDone?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);
    start(async () => {
      const res = await addComment(postId, body, parentId);
      if (!res.ok) {
        setError(res.error ?? "تعذّر إرسال التعليق");
        return;
      }
      setBody("");
      onDone?.();
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={compact ? 2 : 3}
        placeholder={parentId ? "اكتب رداً…" : "شارك رأيك في النقاش…"}
        className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none"
      />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending || !body.trim()}>
          {pending ? "جارٍ الإرسال…" : parentId ? "رد" : "نشر التعليق"}
        </Button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="text-sm text-slate-400 hover:text-white"
          >
            إلغاء
          </button>
        )}
        {error && <span className="text-sm text-red-300">{error}</span>}
      </div>
    </form>
  );
}
