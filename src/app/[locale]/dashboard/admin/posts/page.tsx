import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PostsTable, type PostRow } from "@/components/dashboard/posts-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { Plus, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  let posts: PostRow[] = [];
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const { data } = await supabase
      .from("posts")
      .select("id,title,slug,status,updated_at")
      .order("updated_at", { ascending: false });
    posts = data ?? [];
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        title="المنشورات"
        subtitle="أنشئ وحرّر منشورات المدونة بدون كود."
        action={
          <Button href="/dashboard/admin/posts/new">
            <Plus className="h-4 w-4" />
            منشور جديد
          </Button>
        }
      />

      <PostsTable rows={posts} />
    </div>
  );
}
