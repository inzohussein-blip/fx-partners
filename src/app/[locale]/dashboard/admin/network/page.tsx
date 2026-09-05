import { PageHeader } from "@/components/dashboard/page-header";
import { Share2 } from "lucide-react";
import { NetworkMap } from "@/components/dashboard/network-map";
import { getNetwork } from "@/lib/network";

export const dynamic = "force-dynamic";

export default async function AdminNetworkPage() {
  const brokers = await getNetwork();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Share2}
        title="خريطة الشبكة"
        subtitle="شجرة مرئية لشركاتك وروابط الإحالة والكوبونات — اسحب العقد، واضغط أي عقدة لتعديلها فوراً."
      />
      <NetworkMap brokers={brokers} />
    </div>
  );
}
