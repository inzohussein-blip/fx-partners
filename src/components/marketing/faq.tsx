import { Container } from "@/components/ui/container";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "كيف أبدأ كوكيل (IB) أو شريك تسويق؟",
    a: "أنشئ حساباً مجاناً خلال دقائق، وبعد اعتماد حسابك تحصل على كود وكيل وروابط إحالة تبدأ بمشاركتها فوراً.",
  },
  {
    q: "ما نماذج العمولة المتاحة؟",
    a: "نوفّر نموذج نسبة من الأرباح (Revenue Share) حتى 60%، أو مبلغ ثابت لكل عميل مؤهّل (CPA)، بالإضافة إلى نظام Sub-IB متعدد المستويات.",
  },
  {
    q: "متى وكيف أستلم أرباحي؟",
    a: "تُحتسب أرباحك تلقائياً في محفظتك، ويمكنك طلب السحب عبر التحويل البنكي أو العملات الرقمية أو المحافظ الإلكترونية، وتُعالج الطلبات بسرعة وشفافية.",
  },
  {
    q: "كيف أتابع أداء إحالاتي؟",
    a: "من لوحة التحكم تتابع النقرات والتسجيلات وحجم التداول والأرباح لكل حملة عبر رسوم بيانية وجداول تفصيلية حيّة.",
  },
  {
    q: "هل بياناتي المالية آمنة؟",
    a: "نعم، نطبّق حماية صارمة على مستوى كل صف في قاعدة البيانات (RLS)، فبياناتك معزولة ولا يصل إليها أحد سواك.",
  },
];

export function Faq() {
  return (
    <section className="py-20">
      <Container className="max-w-3xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            الأسئلة الشائعة
          </h2>
          <p className="mt-4 text-slate-400">
            كل ما تحتاج معرفته قبل الانضمام إلى برنامج الشراكة.
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="card-surface group px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-right font-medium text-white">
                {f.q}
                <Plus className="h-4 w-4 shrink-0 text-brand-400 transition group-open:rotate-45" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
