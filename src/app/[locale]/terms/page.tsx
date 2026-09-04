import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "الشروط والأحكام",
  description:
    "شروط استخدام منصة FX Partners — طبيعة الخدمة، الإفصاح عن الشراكة، وتحذير المخاطر.",
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "١) قبول الشروط",
    body: [
      "باستخدامك منصة FX Partners فإنك توافق على هذه الشروط والأحكام بالكامل. إن لم توافق عليها، يُرجى عدم استخدام المنصة.",
    ],
  },
  {
    title: "٢) طبيعة الخدمة",
    body: [
      "FX Partners منصة تعريفية وتسويقية (Introducing Broker / Affiliate) تربط الوكلاء والمسوّقين والعملاء بشركات التداول. نحن لسنا شركة وساطة ولا نقدّم خدمات إيداع أو سحب أو تنفيذ صفقات.",
      "كل ما يُعرض من مقارنات وتقييمات وأدوات هو لأغراض إعلامية فقط، ولا يُعدّ نصيحة استثمارية أو مالية أو توصية بالتداول لدى أي شركة.",
    ],
  },
  {
    title: "٣) الإفصاح عن الشراكة",
    body: [
      "قد نحصل على عمولة عند فتحك حساباً لدى شركة تداول عبر روابط الإحالة الموجودة في المنصة. هذا لا يؤثّر على التكلفة التي تدفعها، وقد لا يؤثّر على ترتيب الشركات المعروضة.",
    ],
  },
  {
    title: "٤) الحسابات والاستخدام",
    body: [
      "أنت مسؤول عن سرية بيانات دخولك وعن كل النشاط الذي يجري عبر حسابك.",
      "يُمنع استخدام المنصة لأي غرض غير قانوني، أو نشر محتوى مسيء أو مضلّل، أو محاولة التلاعب بأنظمة الإحالة والتقييم.",
    ],
  },
  {
    title: "٥) شركات التداول الخارجية",
    body: [
      "تعاملك مع أي شركة تداول يخضع لشروط تلك الشركة وحدها. لا نتحمّل مسؤولية سياسات أو عروض أو قرارات أو أداء أي شركة خارجية.",
    ],
  },
  {
    title: "٦) الملكية الفكرية",
    body: [
      "كل المحتوى والعلامات والتصاميم في المنصة مملوكة لـ FX Partners أو مرخّصة لها، ولا يجوز نسخها أو إعادة استخدامها دون إذن كتابي.",
    ],
  },
  {
    title: "٧) حدود المسؤولية",
    body: [
      "تُقدَّم المنصة «كما هي» دون أي ضمانات. لا نتحمّل أي خسائر مباشرة أو غير مباشرة ناتجة عن استخدام المنصة أو الاعتماد على محتواها.",
    ],
  },
  {
    title: "٨) تحذير المخاطر",
    body: [
      "التداول في العملات والمشتقات والرافعة المالية ينطوي على مخاطر عالية وقد يؤدي إلى خسارة رأس المال بالكامل. لا تتداول بأموال لا يمكنك تحمّل خسارتها.",
    ],
  },
  {
    title: "٩) التعديلات والقانون",
    body: [
      "يحقّ لنا تعديل هذه الشروط في أي وقت، ويسري التعديل فور نشره. استمرارك في الاستخدام يعني قبولك للنسخة المحدّثة.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <section className="py-14">
        <Container className="max-w-3xl">
          <Breadcrumbs items={[{ label: "الشروط والأحكام" }]} />
          <h1 className="mt-6 text-3xl font-extrabold text-white sm:text-4xl">
            الشروط والأحكام
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            آخر تحديث: {new Intl.DateTimeFormat("ar", { dateStyle: "long" }).format(new Date())}
          </p>

          <div className="mt-10 space-y-8">
            {SECTIONS.map((s) => (
              <section key={s.title}>
                <h2 className="text-lg font-semibold text-white">{s.title}</h2>
                {s.body.map((p, i) => (
                  <p key={i} className="mt-2 text-sm leading-relaxed text-slate-400">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
