import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { ForumModeration } from "@/components/dashboard/forum-moderation";
import { createClient } from "@/lib/supabase/server";
import { getAllChannels, getRecentComments } from "@/lib/forum";
import { MessagesSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminForumPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect("/dashboard");
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/admin/forum");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/dashboard");

  const [channels, comments] = await Promise.all([
    getAllChannels(),
    getRecentComments(50),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        icon={MessagesSquare}
        title="إدارة المنتدى"
        subtitle="اعتماد قنوات الوكلاء، حظر المخالف، والإشراف على التعليقات."
      />
      <ForumModeration channels={channels} comments={comments} />
    </div>
  );
}
