"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Link } from "@/i18n/navigation";
import {
  categoryMeta,
  timeAgo,
  type Announcement,
} from "@/lib/announcements";
import { Bell, ArrowLeft } from "lucide-react";

const SEEN_KEY = "fx_ann_seen_at";

function readSeen(): number {
  try {
    return Number(localStorage.getItem(SEEN_KEY) || 0);
  } catch {
    return 0;
  }
}

export function AnnouncementsBell() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [open, setOpen] = useState(false);
  const [seenAt, setSeenAt] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSeenAt(readSeen());
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("announcements")
          .select("id,title,body,category,published_at")
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(10);
        setItems((data as Announcement[]) ?? []);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  // Close on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const unread = items.filter(
    (a) => new Date(a.published_at).getTime() > seenAt
  ).length;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && items.length) {
      const latest = new Date(items[0].published_at).getTime();
      try {
        localStorage.setItem(SEEN_KEY, String(latest));
      } catch {
        /* ignore */
      }
      setSeenAt(latest);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="الإشعارات"
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-ink-900/40 text-slate-400 transition hover:text-white"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-gradient px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute start-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-white/10 bg-ink-800 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <span className="text-sm font-semibold text-white">التحديثات</span>
            <Link
              href="/dashboard/updates"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1 text-xs text-brand-300 hover:text-brand-200"
            >
              عرض الكل
              <ArrowLeft className="h-3 w-3" />
            </Link>
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              لا توجد تحديثات بعد.
            </p>
          ) : (
            <ul className="max-h-96 divide-y divide-white/5 overflow-y-auto">
              {items.map((a) => {
                const meta = categoryMeta(a.category);
                return (
                  <li key={a.id} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] ${meta.className}`}
                      >
                        {meta.emoji} {meta.label}
                      </span>
                      <span className="text-[10px] text-slate-600">
                        {timeAgo(a.published_at)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-white">{a.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">
                      {a.body}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
