import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import { AgreementSigner } from "@/components/dashboard/agreement-signer";
import { AgreementDownload } from "@/components/dashboard/agreement-download";
import { CheckCircle2, FileSignature } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AgreementPage() {
  let signedAt: string | null = null;
  let defaultName = "";

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const [{ data: agreement }, { data: profile }] = await Promise.all([
        supabase
          .from("agreements")
          .select("signed_at")
          .eq("user_id", user.id)
          .order("signed_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle(),
      ]);
      signedAt = agreement?.signed_at ?? null;
      defaultName = profile?.full_name ?? "";
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileSignature}
        title={"اتفاقية الشراكة"}
        subtitle={"وقّع اتفاقية الشراكة إلكترونياً واحتفظ بنسخة PDF موقّعة."}
      />

      {signedAt ? (
        <section className="card-surface p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-500/10 text-brand-300">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-white">
            الاتفاقية موقّعة ✅
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            تم التوقيع بتاريخ {new Date(signedAt).toLocaleDateString("ar")}.
          </p>
          <div className="mt-6 flex justify-center">
            <AgreementDownload />
          </div>
        </section>
      ) : (
        <AgreementSigner defaultName={defaultName} />
      )}
    </div>
  );
}
