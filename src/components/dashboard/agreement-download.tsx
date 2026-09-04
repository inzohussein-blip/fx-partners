"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getAgreementUrl } from "@/lib/actions/agreement";
import { Download } from "lucide-react";

export function AgreementDownload() {
  const [pending, startTransition] = useTransition();

  function download() {
    startTransition(async () => {
      const res = await getAgreementUrl();
      if (!res.ok || !res.url) {
        toast.error("تعذّر جلب المستند");
        return;
      }
      window.open(res.url, "_blank", "noopener");
    });
  }

  return (
    <Button type="button" variant="secondary" onClick={download} disabled={pending}>
      <Download className="h-4 w-4" />
      {pending ? "جارٍ التحضير…" : "تنزيل الاتفاقية (PDF)"}
    </Button>
  );
}
