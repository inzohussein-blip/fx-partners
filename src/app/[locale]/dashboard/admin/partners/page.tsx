import { createClient } from "@/lib/supabase/server";
import { PartnersManager } from "@/components/dashboard/partners-manager";

export const dynamic = "force-dynamic";

type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  category: string | null;
  sort_order: number;
  is_active: boolean;
};

export default async function AdminPartnersPage() {
  let partners: Partner[] = [];
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const { data } = await supabase
      .from("partners")
      .select("id,name,logo_url,website,description,category,sort_order,is_active")
      .order("sort_order");
    partners = data ?? [];
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">الشركاء</h1>
        <p className="mt-1 text-sm text-slate-400">
          أضِف وحرّر شركات التداول والسيولة والتقنية المعروضة في صفحة B2B.
        </p>
      </header>

      <PartnersManager
        partners={partners.map((p) => ({
          id: p.id,
          name: p.name,
          logo_url: p.logo_url ?? "",
          website: p.website ?? "",
          description: p.description ?? "",
          category: p.category ?? "broker",
          sort_order: p.sort_order,
          is_active: p.is_active,
        }))}
      />
    </div>
  );
}
