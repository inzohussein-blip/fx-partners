"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  SignaturePad,
  type SignaturePadHandle,
} from "@/components/dashboard/signature-pad";
import { signAgreement } from "@/lib/actions/agreement";
import { Eraser } from "lucide-react";

const CLAUSES = [
  "أوافق على الترويج لخدمات FX Partners بطريقة قانونية وأخلاقية.",
  "تُحتسب العمولات حسب مستوى شراكتي وتُدفع وفق سياسة الشركة.",
  "ألتزم بالحفاظ على سرية المعلومات (NDA) وعدم تحريف تمثيل الشركة.",
  "يجوز لأي طرف إنهاء الاتفاقية بإشعار كتابي، مع بقاء العمولات المستحقّة قابلة للدفع.",
];

export function AgreementSigner({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const padRef = useRef<SignaturePadHandle>(null);
  const [name, setName] = useState(defaultName);
  const [pending, startTransition] = useTransition();

  function submit() {
    const pad = padRef.current;
    if (!pad || pad.isEmpty()) {
      toast.error("يرجى التوقيع في المربّع أولاً");
      return;
    }
    if (!name.trim()) {
      toast.error("أدخل اسمك الكامل");
      return;
    }
    const signatureDataUrl = pad.toDataURL();
    startTransition(async () => {
      const res = await signAgreement({ signatureDataUrl, signerName: name });
      if (!res.ok) toast.error(res.error ?? "تعذّر حفظ الاتفاقية");
      else {
        toast.success("تم توقيع الاتفاقية وحفظها بنجاح");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="card-surface p-6">
        <h2 className="text-lg font-semibold text-white">اتفاقية الشراكة</h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-300">
          {CLAUSES.map((c, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-brand-300">{i + 1}.</span>
              {c}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-slate-500">
          بالتوقيع أدناه فإنك تقرّ بموافقتك على شروط وأحكام الشراكة. يُحفظ المستند
          الموقّع (PDF) بشكل آمن في حسابك.
        </p>
      </section>

      <section className="card-surface p-6">
        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-300">
            الاسم الكامل (بالأحرف اللاتينية للمستند)
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            dir="ltr"
            placeholder="Full name"
            className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none sm:w-80"
          />
        </label>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-slate-300">التوقيع</span>
            <button
              type="button"
              onClick={() => padRef.current?.clear()}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
            >
              <Eraser className="h-3.5 w-3.5" />
              مسح
            </button>
          </div>
          <SignaturePad ref={padRef} />
          <p className="mt-2 text-xs text-slate-500">
            وقّع بإصبعك أو الماوس داخل المربّع.
          </p>
        </div>

        <div className="mt-6">
          <Button type="button" onClick={submit} disabled={pending}>
            {pending ? "جارٍ الحفظ…" : "توقيع الاتفاقية"}
          </Button>
        </div>
      </section>
    </div>
  );
}
