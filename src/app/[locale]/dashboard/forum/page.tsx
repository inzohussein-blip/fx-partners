import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { ForumManager } from "@/components/dashboard/forum-manager";
import { createClient } from "@/lib/supabase/server";
import { getMyChannels, getPostsForChannels } from "@/lib/forum";
import { MessagesSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardForumPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect("/dashboard");
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/forum");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = profile?.role ?? "partner";
  const canCreate = role === "ib" || role === "admin";

  const channels = await getMyChannels(user.id);
  const postsByChannel = await getPostsForChannels(channels.map((c) => c.id));

  return (
    <div className="space-y-8">
      <PageHeader
        icon={MessagesSquare}
        title="قناتي في المنتدى"
        subtitle="أنشئ قناتك الخاصة وانشر تحليلاتك وتوصياتك لمجتمع FX Partners."
      />
      <ForumManager
        channels={channels}
        postsByChannel={postsByChannel}
        canCreate={canCreate}
      />
    </div>
  );
}
