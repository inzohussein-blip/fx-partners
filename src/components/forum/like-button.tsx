"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { togglePostReaction } from "@/lib/actions/forum";

/** Toggle a like on a post. Optimistic; redirects guests to sign in. */
export function LikeButton({
  postId,
  initialLiked,
  initialCount,
  isAuthed,
}: {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  isAuthed: boolean;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, start] = useTransition();

  function onClick() {
    if (!isAuthed) {
      router.push("/login?redirect=/forum");
      return;
    }
    // optimistic
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    start(async () => {
      const res = await togglePostReaction(postId);
      if (!res.ok || !res.data) {
        // rollback
        setLiked(!next);
        setCount((c) => c + (next ? -1 : 1));
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={liked}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
        liked
          ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
          : "border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
      {count}
    </button>
  );
}
