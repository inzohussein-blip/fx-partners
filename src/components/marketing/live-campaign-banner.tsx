"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Link } from "@/i18n/navigation";
import { Megaphone, X, ArrowLeft } from "lucide-react";

type Campaign = {
  id: string;
  broker_slug: string | null;
  title: string;
  message: string;
  cta_label: string | null;
};

const DISMISS_KEY = "fx_campaign_dismissed";

function dismissed(id: string): boolean {
  try {
    return (localStorage.getItem(DISMISS_KEY) || "").split(",").includes(id);
  } catch {
    return false;
  }
}
function dismiss(id: string) {
  try {
    const cur = (localStorage.getItem(DISMISS_KEY) || "").split(",").filter(Boolean);
    if (!cur.includes(id)) cur.push(id);
    localStorage.setItem(DISMISS_KEY, cur.slice(-20).join(","));
  } catch {
    /* ignore */
  }
}

export function LiveCampaignBanner() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createClient();

    function show(c: Campaign) {
      if (dismissed(c.id)) return;
      setCampaign(c);
      requestAnimationFrame(() => setEntering(true));
    }

    (async () => {
      const { data } = await supabase
        .from("campaigns")
        .select("id,broker_slug,title,message,cta_label")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1);
      if (data && data[0]) show(data[0] as Campaign);
    })();

    const channel = supabase
      .channel("campaigns_live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "campaigns" },
        (payload) => show(payload.new as Campaign)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!campaign) return null;

  function close() {
    if (campaign) dismiss(campaign.id);
    setEntering(false);
    setTimeout(() => setCampaign(null), 300);
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[90] flex justify-center px-4 pb-4 transition-all duration-300 ${
        entering ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      <div className="relative flex w-full max-w-2xl items-center gap-4 overflow-hidden rounded-2xl border border-brand-500/30 bg-ink-800/95 p-4 pe-12 shadow-2xl backdrop-blur">
        <div className="hero-glow absolute inset-0 opacity-70" />
        <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
          <Megaphone className="h-5 w-5 animate-pulse" />
        </span>
        <div className="relative min-w-0 flex-1">
          <p className="truncate font-bold text-white">{campaign.title}</p>
          <p className="truncate text-sm text-slate-300">{campaign.message}</p>
        </div>
        {campaign.broker_slug && (
          <Link
            href={`/brokers/${campaign.broker_slug}`}
            onClick={close}
            className="relative inline-flex shrink-0 items-center gap-1 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
          >
            {campaign.cta_label || "سجّل الآن"}
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}
        <button
          onClick={close}
          aria-label="إغلاق"
          className="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
