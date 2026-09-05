import { PageHeader } from "@/components/dashboard/page-header";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { categoryMeta, timeAgo, type Announcement } from "@/lib/announcements";

export const dynamic = "force-dynamic";

async function getAnnouncements(): Promise<Announcement[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("announcements")
      .select("id,title,body,category,published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(50);
    return (data as Announcement[]) ?? [];
  } catch {
    return [];
  }
}

export default async function UpdatesPage() {
  const items = await getAnnouncements();

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Sparkles}
        title={"آخر التحديثات"}
        subtitle={"كل جديد في FX Partners: الميزات، العروض، وتغييرات نسب العمولات."}
      />

      {items.length === 0 ? (
        <div className="card-surface p-10 text-center text-sm text-slate-500">
          لا توجد تحديثات منشورة بعد.
        </div>
      ) : (
        <ol className="relative space-y-6 border-s border-white/10 ps-6">
          {items.map((a) => {
            const meta = categoryMeta(a.category);
            return (
              <li key={a.id} className="relative">
                <span className="absolute -start-[31px] top-1 grid h-6 w-6 place-items-center rounded-full border border-white/10 bg-ink-800 text-xs">
                  {meta.emoji}
                </span>
                <div className="card-surface p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] ${meta.className}`}>
                      {meta.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {timeAgo(a.published_at)}
                    </span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-white">{a.title}</h2>
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-400">
                    {a.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
