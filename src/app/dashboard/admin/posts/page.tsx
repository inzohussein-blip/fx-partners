import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { DeletePostButton } from "@/components/dashboard/post-editor";
import { Plus, Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

type Post = {
  id: string;
  title: string;
  slug: string;
  status: string;
  updated_at: string;
};

const statusLabel: Record<string, { text: string; cls: string }> = {
  draft: { text: "مسودة", cls: "bg-white/10 text-slate-300" },
  published: { text: "منشور", cls: "bg-brand-500/10 text-brand-300" },
  archived: { text: "مؤرشف", cls: "bg-gold-500/10 text-gold-400" },
};

export default async function AdminPostsPage() {
  let posts: Post[] = [];
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const { data } = await supabase
      .from("posts")
      .select("id,title,slug,status,updated_at")
      .order("updated_at", { ascending: false });
    posts = data ?? [];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">المنشورات</h1>
          <p className="mt-1 text-sm text-slate-400">
            أنشئ وحرّر منشورات المدونة بدون كود.
          </p>
        </div>
        <Button href="/dashboard/admin/posts/new">
          <Plus className="h-4 w-4" />
          منشور جديد
        </Button>
      </div>

      <section className="card-surface p-6">
        {posts.length === 0 ? (
          <p className="text-sm text-slate-500">لا توجد منشورات بعد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-right text-sm">
              <thead>
                <tr className="border-b border-white/5 text-slate-400">
                  <th className="pb-3 font-medium">العنوان</th>
                  <th className="pb-3 font-medium">الحالة</th>
                  <th className="pb-3 font-medium">آخر تحديث</th>
                  <th className="pb-3 font-medium">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {posts.map((p) => {
                  const s = statusLabel[p.status] ?? statusLabel.draft;
                  return (
                    <tr key={p.id} className="text-slate-300">
                      <td className="py-3">
                        <div className="font-medium text-white">{p.title}</div>
                        <div className="font-mono text-xs text-slate-500">
                          /{p.slug}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`rounded-md px-2 py-1 text-xs ${s.cls}`}>
                          {s.text}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500">
                        {new Date(p.updated_at).toLocaleDateString("ar")}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/admin/posts/${p.id}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            تحرير
                          </Link>
                          <DeletePostButton id={p.id} />
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
    </div>
  );
}
