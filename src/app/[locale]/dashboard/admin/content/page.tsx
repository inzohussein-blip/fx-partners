import { PageHeader } from "@/components/dashboard/page-header";
import { Type } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ContentStudio } from "@/components/dashboard/content-studio";
import { CONTENT_REGISTRY } from "@/lib/content-registry";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const values: Record<string, Record<string, string>> = {};

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const keys = CONTENT_REGISTRY.map((b) => b.key);
    const { data } = await supabase
      .from("site_content")
      .select("key,value")
      .in("key", keys);
    for (const row of data ?? []) {
      values[row.key] = (row.value as Record<string, string>) ?? {};
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Type}
        title="نصوص الموقع"
        subtitle="حرّر نصوص كل أقسام الموقع من بطاقة واحدة — تُحدَّث الواجهة العامة فوراً."
      />
      <ContentStudio blocks={CONTENT_REGISTRY} values={values} />
    </div>
  );
}
