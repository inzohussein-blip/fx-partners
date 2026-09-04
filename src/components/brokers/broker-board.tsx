"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  createBoardPost,
  deleteBoardPost,
  voteBoardPost,
} from "@/lib/actions/board";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  Reply,
  Trash2,
  Loader2,
  Send,
} from "lucide-react";

export type BoardPost = {
  id: string;
  parent_id: string | null;
  author_name: string | null;
  body: string;
  is_staff: boolean;
  likes: number;
  dislikes: number;
  created_at: string;
};

const VOTER_KEY = "fx_voter_key";
const NAME_KEY = "fx_board_name";

function getVoterKey(): string {
  try {
    let k = localStorage.getItem(VOTER_KEY);
    if (!k) {
      k = crypto.randomUUID();
      localStorage.setItem(VOTER_KEY, k);
    }
    return k;
  } catch {
    return "anon-" + Math.random().toString(36).slice(2);
  }
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `قبل ${mins} د`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `قبل ${hrs} س`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `قبل ${days} يوم`;
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium" }).format(new Date(iso));
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none";

export function BrokerBoard({
  brokerId,
  brokerSlug,
  isAdmin,
  initial,
}: {
  brokerId: string;
  brokerSlug: string;
  isAdmin: boolean;
  initial: BoardPost[];
}) {
  const [posts, setPosts] = useState<BoardPost[]>(initial);
  const [myVotes, setMyVotes] = useState<Record<string, 1 | -1>>({});
  const [voterKey, setVoterKey] = useState("");

  const refresh = useCallback(async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("broker_posts")
      .select("id,parent_id,author_name,body,is_staff,likes,dislikes,created_at")
      .eq("broker_id", brokerId)
      .order("created_at", { ascending: true });
    if (data) setPosts(data as BoardPost[]);
  }, [brokerId]);

  // Load voter key + this browser's existing votes, and subscribe to changes.
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const key = getVoterKey();
    setVoterKey(key);
    const supabase = createClient();

    (async () => {
      const { data } = await supabase
        .from("broker_post_votes")
        .select("post_id,value")
        .eq("voter_key", key);
      if (data) {
        const map: Record<string, 1 | -1> = {};
        for (const v of data as { post_id: string; value: number }[]) {
          map[v.post_id] = v.value === 1 ? 1 : -1;
        }
        setMyVotes(map);
      }
    })();

    const channel = supabase
      .channel(`broker_board:${brokerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "broker_posts",
          filter: `broker_id=eq.${brokerId}`,
        },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [brokerId, refresh]);

  const tree = useMemo(() => {
    const children = new Map<string | null, BoardPost[]>();
    for (const p of posts) {
      const key = p.parent_id;
      (children.get(key) ?? children.set(key, []).get(key)!).push(p);
    }
    return children;
  }, [posts]);

  async function vote(postId: string, value: 1 | -1) {
    if (!voterKey) return;
    // Optimistic count + selection update.
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const cur = myVotes[postId];
        let likes = p.likes;
        let dislikes = p.dislikes;
        if (cur === value) {
          if (value === 1) likes--;
          else dislikes--;
        } else {
          if (value === 1) likes++;
          else dislikes++;
          if (cur === 1) likes--;
          if (cur === -1) dislikes--;
        }
        return { ...p, likes: Math.max(0, likes), dislikes: Math.max(0, dislikes) };
      })
    );
    setMyVotes((prev) => {
      const next = { ...prev };
      if (next[postId] === value) delete next[postId];
      else next[postId] = value;
      return next;
    });
    await voteBoardPost({ postId, value, voterKey });
  }

  const roots = tree.get(null) ?? [];
  const totalCount = posts.length;

  return (
    <div id="board" className="scroll-mt-24">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-brand-300" />
        <h2 className="text-xl font-bold text-white">
          منتدى النقاش ({totalCount})
        </h2>
      </div>
      <p className="mt-1 text-sm text-slate-400">
        اطرح سؤالك عن الشركة، وشارك تجربتك، وصوّت على أصدق الردود.
      </p>

      {/* New thread */}
      <div className="card-surface mt-5 p-5">
        <NewPostForm
          brokerId={brokerId}
          brokerSlug={brokerSlug}
          placeholder="اطرح سؤالاً أو ابدأ نقاشاً جديداً…"
          cta="نشر"
          onDone={refresh}
        />
      </div>

      {/* Threads */}
      <div className="mt-6 space-y-5">
        {roots.length === 0 ? (
          <p className="text-sm text-slate-500">
            لا توجد نقاشات بعد. كن أول من يبدأ الحديث!
          </p>
        ) : (
          roots.map((p) => (
            <PostNode
              key={p.id}
              post={p}
              tree={tree}
              depth={0}
              brokerId={brokerId}
              brokerSlug={brokerSlug}
              isAdmin={isAdmin}
              myVotes={myVotes}
              onVote={vote}
              onRefresh={refresh}
            />
          ))
        )}
      </div>
    </div>
  );
}

function PostNode({
  post,
  tree,
  depth,
  brokerId,
  brokerSlug,
  isAdmin,
  myVotes,
  onVote,
  onRefresh,
}: {
  post: BoardPost;
  tree: Map<string | null, BoardPost[]>;
  depth: number;
  brokerId: string;
  brokerSlug: string;
  isAdmin: boolean;
  myVotes: Record<string, 1 | -1>;
  onVote: (id: string, v: 1 | -1) => void;
  onRefresh: () => void;
}) {
  const [replying, setReplying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const replies = tree.get(post.id) ?? [];
  const my = myVotes[post.id];
  const indent = Math.min(depth, 3);

  async function remove() {
    if (!confirm("حذف هذه المشاركة وكل ردودها؟")) return;
    setDeleting(true);
    await deleteBoardPost(post.id);
    setDeleting(false);
    onRefresh();
  }

  return (
    <div
      className={indent > 0 ? "border-s border-white/10 ps-4" : ""}
      style={indent > 0 ? { marginInlineStart: 4 } : undefined}
    >
      <div
        className={`rounded-2xl border p-4 ${
          post.is_staff
            ? "border-brand-500/30 bg-brand-500/[0.06]"
            : "border-white/5 bg-ink-900/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">
              {post.author_name || "مستخدم"}
            </span>
            {post.is_staff && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] text-brand-200">
                <ShieldCheck className="h-3 w-3" /> الإدارة
              </span>
            )}
            <span className="text-[11px] text-slate-600">{timeAgo(post.created_at)}</span>
          </div>
        </div>

        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-300" dir="auto">
          {post.body}
        </p>

        <div className="mt-3 flex items-center gap-1 text-xs">
          <button
            onClick={() => onVote(post.id, 1)}
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 transition ${
              my === 1
                ? "bg-emerald-500/15 text-emerald-300"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <ThumbsUp className="h-3.5 w-3.5" /> {post.likes}
          </button>
          <button
            onClick={() => onVote(post.id, -1)}
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 transition ${
              my === -1
                ? "bg-red-500/15 text-red-300"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <ThumbsDown className="h-3.5 w-3.5" /> {post.dislikes}
          </button>
          <button
            onClick={() => setReplying((r) => !r)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <Reply className="h-3.5 w-3.5" /> رد
          </button>
          {isAdmin && (
            <button
              onClick={remove}
              disabled={deleting}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
            >
              {deleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>

        {replying && (
          <div className="mt-3">
            <NewPostForm
              brokerId={brokerId}
              brokerSlug={brokerSlug}
              parentId={post.id}
              placeholder="اكتب ردّك…"
              cta="رد"
              compact
              onDone={() => {
                setReplying(false);
                onRefresh();
              }}
            />
          </div>
        )}
      </div>

      {replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {replies.map((r) => (
            <PostNode
              key={r.id}
              post={r}
              tree={tree}
              depth={depth + 1}
              brokerId={brokerId}
              brokerSlug={brokerSlug}
              isAdmin={isAdmin}
              myVotes={myVotes}
              onVote={onVote}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NewPostForm({
  brokerId,
  brokerSlug,
  parentId,
  placeholder,
  cta,
  compact,
  onDone,
}: {
  brokerId: string;
  brokerSlug: string;
  parentId?: string;
  placeholder: string;
  cta: string;
  compact?: boolean;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(NAME_KEY);
      if (saved) setName(saved);
    } catch {
      /* ignore */
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await createBoardPost({
      brokerId,
      brokerSlug,
      parentId: parentId ?? null,
      authorName: name,
      body,
    });
    setBusy(false);
    if (res.ok) {
      try {
        localStorage.setItem(NAME_KEY, name);
      } catch {
        /* ignore */
      }
      setBody("");
      onDone();
    } else {
      setError(res.error ?? "تعذّر النشر.");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={inputCls}
        placeholder="اسمك أو اسم مستعار"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={compact ? 2 : 3}
        className={inputCls}
        placeholder={placeholder}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {cta}
      </button>
    </form>
  );
}
