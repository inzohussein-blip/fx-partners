"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Copy, Check, Plus } from "lucide-react";

type Link = {
  id: string;
  slug: string;
  campaign: string | null;
  target_url: string;
  clicks: number;
  signups: number;
};

export function ReferralGenerator({
  ibId,
  ibCode,
  initialLinks,
  siteUrl,
}: {
  ibId: string | null;
  ibCode: string | null;
  initialLinks: Link[];
  siteUrl: string;
}) {
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [campaign, setCampaign] = useState("");
  const [target, setTarget] = useState("/");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function fullUrl(link: Link) {
    // Tracking route: increments clicks, sets attribution cookie, redirects.
    return `${siteUrl}/r/${link.slug}`;
  }

  async function copy(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("تم نسخ رابط الإحالة بنجاح");
    setTimeout(() => setCopied(null), 1500);
  }

  async function createLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!ibId) {
      setError("لا يوجد حساب IB مرتبط بحسابك بعد. تواصل مع الإدارة للتفعيل.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const slug = `${(ibCode ?? "ib").toLowerCase()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;

    const { data, error } = await supabase
      .from("referral_links")
      .insert({ ib_id: ibId, slug, campaign: campaign || null, target_url: target })
      .select("id,slug,campaign,target_url,clicks,signups")
      .single();

    setLoading(false);
    if (error) {
      setError(error.message);
      toast.error("تعذّر إنشاء الرابط");
      return;
    }
    if (data) {
      setLinks([data, ...links]);
      setCampaign("");
      toast.success("تم إنشاء رابط الإحالة");
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={createLink} className="card-surface p-6">
        <h2 className="text-lg font-semibold text-white">توليد رابط إحالة جديد</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-300">اسم الحملة</span>
            <input
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="facebook-q1"
              className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-300">
              الصفحة الهدف
            </span>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white focus:border-brand-500/50 focus:outline-none"
            >
              <option value="/">الرئيسية</option>
              <option value="/affiliates">صفحة الوكلاء</option>
              <option value="/brokers">صفحة الشركات</option>
            </select>
          </label>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mt-4">
          <Button type="submit" disabled={loading}>
            <Plus className="h-4 w-4" />
            {loading ? "جارٍ الإنشاء…" : "إنشاء الرابط"}
          </Button>
        </div>
      </form>

      <div className="card-surface p-6">
        <h2 className="text-lg font-semibold text-white">روابطك</h2>
        {links.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">لا توجد روابط بعد.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex flex-col gap-3 rounded-xl border border-white/5 bg-ink-900/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {link.campaign && (
                      <span className="rounded-md bg-brand-500/10 px-2 py-0.5 text-xs text-brand-300">
                        {link.campaign}
                      </span>
                    )}
                    <span className="text-xs text-slate-500">
                      {link.clicks} نقرة · {link.signups} تسجيل
                    </span>
                  </div>
                  <p className="mt-1 truncate font-mono text-sm text-slate-300">
                    {fullUrl(link)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => copy(fullUrl(link), link.id)}
                  className="shrink-0"
                >
                  {copied === link.id ? (
                    <Check className="h-4 w-4 text-brand-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  نسخ
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
