import { createClient } from "@/lib/supabase/server";
import {
  MeetingsManager,
  type AdminSlot,
  type AdminBooking,
} from "@/components/dashboard/meetings-manager";

export const dynamic = "force-dynamic";

export default async function AdminMeetingsPage() {
  let slots: AdminSlot[] = [];
  let bookings: AdminBooking[] = [];

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const [{ data: s }, { data: b }] = await Promise.all([
      supabase
        .from("meeting_slots")
        .select("id,starts_at,duration_min,meeting_url,status")
        .order("starts_at", { ascending: false })
        .limit(100),
      supabase
        .from("bookings")
        .select(
          "id,company_name,contact_name,email,phone,meeting_type,message,status,created_at,slot:meeting_slots(starts_at)"
        )
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    slots = (s as AdminSlot[]) ?? [];
    bookings =
      (b as unknown as (Omit<AdminBooking, "slot"> & {
        slot: { starts_at: string } | { starts_at: string }[] | null;
      })[])?.map((row) => ({
        ...row,
        slot: Array.isArray(row.slot) ? row.slot[0] ?? null : row.slot,
      })) ?? [];
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">اجتماعات الشراكات B2B</h1>
        <p className="mt-1 text-sm text-slate-400">
          انشر مواعيد متاحة على صفحة B2B، وأدر حجوزات شركات التداول والوكلاء
          الرئيسيين. تصلك إشعارات تلغرام عند كل حجز جديد.
        </p>
      </header>

      <MeetingsManager slots={slots} bookings={bookings} />
    </div>
  );
}
