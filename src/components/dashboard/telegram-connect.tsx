"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateTelegramLink } from "@/lib/actions/settings";

export function TelegramConnect({ linked }: { linked: boolean }) {
  const [pending, startTransition] = useTransition();
  const [url, setUrl] = useState<string | null>(null);

  function connect() {
    startTransition(async () => {
      const res = await generateTelegramLink();
      if (!res.ok || !res.url) {
        toast.error(res.error ?? "تعذّر إنشاء رابط الربط");
        return;
      }
      setUrl(res.url);
      window.open(res.url, "_blank", "noopener");
      toast.success("افتح تليغرام واضغط Start لإتمام الربط");
    });
  }

  return (
    <section className="card-surface p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Send className="h-4 w-4 text-brand-300" />
            تنبيهات تليغرام
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            استقبل تنبيهاً فورياً عند تسجيل إحالة جديدة أو نزول عمولة في محفظتك.
          </p>
        </div>
        {linked && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-300">
            <CheckCircle2 className="h-4 w-4" />
            مرتبط
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="button" variant={linked ? "secondary" : "primary"} onClick={connect} disabled={pending}>
          <Send className="h-4 w-4" />
          {pending ? "جارٍ التجهيز…" : linked ? "إعادة الربط" : "ربط حساب تليغرام"}
        </Button>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brand-300 underline hover:text-brand-200"
          >
            افتح رابط البوت يدوياً
          </a>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        عند الضغط، يُفتح البوت في تليغرام — اضغط <span className="text-slate-300">Start</span>{" "}
        لإتمام الربط.
      </p>
    </section>
  );
}
