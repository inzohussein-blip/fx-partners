import { createClient } from "@/lib/supabase/server";
import { ClientsTable, type ClientRow } from "@/components/dashboard/clients-table";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  let rows: ClientRow[] = [];

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: ib } = await supabase
        .from("ib_accounts")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (ib) {
        const { data } = await supabase
          .from("referrals")
          .select(
            "id,client_email,client_ref,status,trading_volume,created_at,referral_links:link_id(campaign)"
          )
          .eq("ib_id", ib.id)
          .order("created_at", { ascending: false });

        rows = (data ?? []).map((r) => {
          const rel = r.referral_links as
            | { campaign: string | null }
            | { campaign: string | null }[]
            | null;
          const link = Array.isArray(rel) ? rel[0] : rel;
          return {
            id: r.id,
            client_email: r.client_email,
            client_ref: r.client_ref,
            status: r.status,
            trading_volume: Number(r.trading_volume ?? 0),
            created_at: r.created_at,
            campaign: link?.campaign ?? null,
          };
        });
      }
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">العملاء</h1>
        <p className="mt-1 text-sm text-slate-400">
          العملاء المسجّلون من خلال روابط إحالتك — بحث وفرز وفلترة.
        </p>
      </header>

      <ClientsTable rows={rows} />
    </div>
  );
}
