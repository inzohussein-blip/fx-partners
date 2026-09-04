import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { TelegramConnect } from "@/components/dashboard/telegram-connect";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let profile = {
    full_name: "",
    company_name: "",
    country: "",
    phone: "",
    email: "",
    ib_code: null as string | null,
  };
  let telegramLinked = false;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const [{ data: p }, { data: ib }] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name,company_name,country,phone,telegram_chat_id")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("ib_accounts")
          .select("ib_code")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      profile = {
        full_name: p?.full_name ?? "",
        company_name: p?.company_name ?? "",
        country: p?.country ?? "",
        phone: p?.phone ?? "",
        email: user.email ?? "",
        ib_code: ib?.ib_code ?? null,
      };
      telegramLinked = Boolean(p?.telegram_chat_id);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">الإعدادات</h1>
        <p className="mt-1 text-sm text-slate-400">
          حدّث بيانات ملفك الشخصي ومعلومات التواصل.
        </p>
      </header>

      <SettingsForm profile={profile} />
      <TelegramConnect linked={telegramLinked} />
    </div>
  );
}
