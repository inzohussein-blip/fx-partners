import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostEditor } from "@/components/dashboard/post-editor";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  const isNew = params.id === "new";
  let post = undefined;

  if (!isNew && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const { data } = await supabase
      .from("posts")
      .select("id,title,slug,excerpt,body,cover_image,status")
      .eq("id", params.id)
      .maybeSingle();
    if (!data) notFound();
    post = data;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/admin/posts"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
        >
          <ArrowRight className="h-4 w-4" />
          كل المنشورات
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-white">
          {isNew ? "منشور جديد" : "تحرير المنشور"}
        </h1>
      </div>

      <PostEditor post={post ?? undefined} />
    </div>
  );
}
