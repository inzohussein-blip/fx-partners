import { PageHeader } from "@/components/dashboard/page-header";
import { Images } from "lucide-react";
import { MediaLibrary } from "@/components/dashboard/media-library";
import { listMedia } from "@/lib/media";
import { setRequestLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const items = await listMedia();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Images}
        title="معرض الوسائط"
        subtitle="ارفع الصور وأعد استخدامها في المقالات والشعارات — انسخ رابط أي صورة بضغطة."
      />
      <MediaLibrary items={items} />
    </div>
  );
}
