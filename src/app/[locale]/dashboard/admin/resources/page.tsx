import { PageHeader } from "@/components/dashboard/page-header";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  ResourcesManager,
  type AdminResource,
} from "@/components/dashboard/resources-manager";
import { ReorderPanel } from "@/components/dashboard/reorder-panel";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  let resources: AdminResource[] = [];
  let brokers: { id: string; name: string }[] = [];

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const [{ data: r }, { data: b }] = await Promise.all([
      supabase
        .from("trading_resources")
        .select("id,title,kind,file_url,downloads,is_active,brokers(name)")
        .order("sort_order")
        .limit(200),
      supabase.from("brokers").select("id,name").order("sort_order"),
    ]);
    resources = ((r as unknown[]) ?? []).map((raw) => {
      const row = raw as AdminResource & { brokers: { name: string } | null };
      return { ...row, broker_name: row.brokers?.name ?? null };
    });
    brokers = (b as { id: string; name: string }[]) ?? [];
  }

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Download}
        title="الأدوات المجانية"
        subtitle="أضِف مؤشرات وقوالب وكتب — يشترط النظام فتح حساب عبر رابط الشركة قبل التحميل."
      />
      {resources.length > 1 && (
        <details className="card-surface p-5">
          <summary className="cursor-pointer text-sm font-semibold text-white">
            ترتيب عرض الأدوات (سحب وإفلات)
          </summary>
          <div className="mt-4">
            <ReorderPanel
              table="trading_resources"
              items={resources.map((r) => ({ id: r.id, label: r.title, sublabel: r.kind }))}
            />
          </div>
        </details>
      )}

      <ResourcesManager resources={resources} brokers={brokers} />
    </div>
  );
}
