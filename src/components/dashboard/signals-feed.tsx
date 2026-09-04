"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { directionMeta, type Signal } from "@/lib/signals";
import { TrendingUp } from "lucide-react";

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `قبل ${mins} د`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `قبل ${hrs} س`;
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(iso)
  );
}

export function SignalsFeed({ initial }: { initial: Signal[] }) {
  const [signals, setSignals] = useState<Signal[]>(initial);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createClient();

    async function refresh(flashId?: string) {
      const { data } = await supabase
        .from("signals")
        .select("id,broker_id,title,body,symbol,direction,published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(50);
      if (data) setSignals(data as Signal[]);
      if (flashId) {
        setFlash(flashId);
        setTimeout(() => setFlash(null), 2500);
      }
    }

    const channel = supabase
      .channel("signals_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "signals" },
        (payload) => refresh((payload.new as { id: string }).id)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "signals" },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (signals.length === 0) {
    return (
      <div className="card-surface p-10 text-center text-sm text-slate-500">
        لا توجد توصيات منشورة بعد.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {signals.map((s) => {
        const dir = directionMeta(s.direction);
        return (
          <div
            key={s.id}
            className={`card-surface p-5 transition ${
              flash === s.id ? "ring-2 ring-brand-400/70" : ""
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-300" />
              <h3 className="font-semibold text-white">{s.title}</h3>
              {s.symbol && (
                <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-slate-300" dir="ltr">
                  {s.symbol}
                </span>
              )}
              {dir && (
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${dir.className}`}>
                  {dir.emoji} {dir.label}
                </span>
              )}
              <span className="ms-auto text-xs text-slate-600">
                {timeAgo(s.published_at)}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-300" dir="auto">
              {s.body}
            </p>
          </div>
        );
      })}
    </div>
  );
}
