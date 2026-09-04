import { createClient } from "@/lib/supabase/server";
import { ContentEditor, type ContentField } from "@/components/dashboard/content-editor";

export const dynamic = "force-dynamic";

type Block = {
  key: string;
  title: string;
  description?: string;
  fields: ContentField[];
};

// The editable content blocks the marketing site reads.
const BLOCKS: Block[] = [
  {
    key: "home.hero",
    title: "الصفحة الرئيسية — القسم الرئيسي (Hero)",
    description: "العنوان والوصف وزر الدعوة في أعلى الصفحة الرئيسية.",
    fields: [
      { name: "titleTop", label: "العنوان (الجزء الأبيض)" },
      { name: "titleAccent", label: "العنوان (الكلمة المميّزة)" },
      { name: "subtitle", label: "الوصف", multiline: true },
      { name: "cta", label: "نص الزر" },
    ],
  },
  {
    key: "home.stats",
    title: "الصفحة الرئيسية — الأرقام",
    description: "الإحصائيات المعروضة أسفل القسم الرئيسي.",
    fields: [
      { name: "partners", label: "عدد الشركاء" },
      { name: "volume", label: "حجم التداول" },
      { name: "countries", label: "عدد الدول" },
      { name: "payout", label: "الأرباح المدفوعة" },
    ],
  },
  {
    key: "affiliates.rates",
    title: "صفحة الوكلاء — النسب",
    description: "أرقام العمولات المعروضة في صفحة الوكلاء.",
    fields: [
      { name: "revenue_share", label: "Revenue Share" },
      { name: "cpa", label: "CPA" },
      { name: "sub_ib", label: "Sub-IB" },
    ],
  },
];

export default async function AdminContentPage() {
  const values: Record<string, Record<string, string>> = {};

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const keys = BLOCKS.map((b) => b.key);
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
      <header>
        <h1 className="text-2xl font-bold text-white">نصوص الموقع</h1>
        <p className="mt-1 text-sm text-slate-400">
          عدّل نصوص الصفحات مباشرةً — تُحدّث الواجهة العامة فوراً.
        </p>
      </header>

      <div className="space-y-5">
        {BLOCKS.map((block) => (
          <ContentEditor
            key={block.key}
            blockKey={block.key}
            title={block.title}
            description={block.description}
            fields={block.fields}
            values={values[block.key] ?? {}}
          />
        ))}
      </div>
    </div>
  );
}
