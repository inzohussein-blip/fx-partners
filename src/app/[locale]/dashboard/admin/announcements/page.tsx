import { PageHeader } from "@/components/dashboard/page-header";
import { Megaphone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  AnnouncementsManager,
  type AdminAnnouncement,
} from "@/components/dashboard/announcements-manager";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  let items: AdminAnnouncement[] = [];
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const { data } = await supabase
      .from("announcements")
      .select("id,title,body,category,is_published,published_at")
      .order("published_at", { ascending: false })
      .limit(100);
    items = (data as AdminAnnouncement[]) ?? [];
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Megaphone}
        title={"الإعلانات والتحديثات"}
        subtitle={"انشر تحديثات تظهر للوكلاء في جرس الإشعارات وصفحة التحديثات."}
      />

      <AnnouncementsManager items={items} />
    </div>
  );
}
