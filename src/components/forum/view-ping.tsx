"use client";

import { useEffect, useRef } from "react";
import { incrementForumViews } from "@/lib/actions/forum";

/** Registers a single view for a post once, on mount (client-side). */
export function ViewPing({ postId }: { postId: string }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const key = `fxp_view_${postId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
    void incrementForumViews(postId);
  }, [postId]);
  return null;
}
