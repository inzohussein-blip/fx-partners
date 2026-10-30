import { PageHeader } from "@/components/dashboard/page-header";
import { LayoutTemplate } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { PAGES, pageDef, parseRow, type SectionRow } from "@/lib/page-sections";
import { PageSectionsEditor } from "@/components/dashboard/page-sections-editor";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const { page: requested } = await props.searchParams;
  const def = pageDef(requested ?? "") ?? PAGES[0];

  let rows: SectionRow[] = [];
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { data } = await createClient()
      .from("page_sections")
      .select("kind,builtin,is_visible,config,position")
      .eq("page", def.key)
      .order("position", { ascending: true });
    rows = (data ?? []).map(parseRow).filter((r): r is SectionRow => r !== null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutTemplate}
        title="الصفحات والأقسام"
        subtitle="رتّب أقسام كل صفحة، أخفِ ما لا تريده، وأضف بطاقات ودعوات وبانرات ونصوصاً بالعربية والإنجليزية."
      />
      <PageSectionsEditor
        key={def.key}
        pages={PAGES.map((p) => ({ key: p.key, label: p.label, path: p.path }))}
        page={def}
        saved={rows}
      />
    </div>
  );
}
