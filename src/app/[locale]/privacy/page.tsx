import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description:
    "كيف تجمع FX Partners بياناتك وتستخدمها وتحميها — الشفافية الكاملة في التعامل مع بياناتك.",
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "١) البيانات التي نجمعها",
    body: [
      "بيانات الحساب: الاسم والبريد الإلكتروني عند التسجيل كشريك.",
      "بيانات الاستخدام: النقرات والإحالات والإحصائيات المرتبطة بحسابك لعرض أدائك.",
      "بيانات تقنية محدودة تُحفظ في متصفّحك (localStorage) مثل تفضيلات العرض والتصويت وحالة الجولة التعريفية — لا تُرسل إلى خوادمنا.",
    ],
  },
  {
    title: "٢) كيف نستخدم بياناتك",
    body: [
      "لتشغيل حسابك وعرض أرباحك وإحالاتك، وإرسال التنبيهات والتحديثات التي تطلبها، وتحسين المنصة.",
      "لا نبيع بياناتك الشخصية لأي طرف ثالث.",
    ],
  },
  {
    title: "٣) ملفات التخزين المحلي (Cookies/Storage)",
    body: [
      "نستخدم تخزيناً محلياً في متصفّحك لأغراض وظيفية (تذكّر التبويب المفضّل، حالة القراءة، تفضيلات بسيطة). يمكنك مسحها من إعدادات المتصفّح في أي وقت.",
    ],
  },
  {
    title: "٤) مزوّدو الخدمة",
    body: [
      "نعتمد على Supabase لتخزين البيانات والمصادقة بشكل آمن، وقد نستخدم خدمات بريد وإشعارات لإرسال الرسائل التي تطلبها. يخضع هؤلاء لسياسات الخصوصية الخاصة بهم.",
      "عند الانتقال إلى شركة تداول عبر روابطنا، تنطبق سياسة خصوصية تلك الشركة على تعاملك معها.",
    ],
  },
  {
    title: "٥) أمان البيانات",
    body: [
      "نطبّق حماية صارمة على مستوى كل صف في قاعدة البيانات (Row Level Security)، فلا يصل أحد إلى بياناتك سواك والجهات المصرّح لها.",
    ],
  },
  {
    title: "٦) حقوقك",
    body: [
      "يحقّ لك الوصول إلى بياناتك أو تصحيحها أو طلب حذف حسابك. تواصل معنا لممارسة هذه الحقوق.",
    ],
  },
  {
    title: "٧) الاحتفاظ بالبيانات",
    body: [
      "نحتفظ ببياناتك طالما كان حسابك نشطاً أو بالقدر اللازم لتقديم الخدمة والامتثال للأنظمة.",
    ],
  },
  {
    title: "٨) التواصل",
    body: [
      "لأي استفسار حول الخصوصية، راسلنا عبر صفحة «اتصل بنا».",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <section className="py-14">
        <Container className="max-w-3xl">
          <Breadcrumbs items={[{ label: "سياسة الخصوصية" }]} />
          <h1 className="mt-6 text-3xl font-extrabold text-white sm:text-4xl">
            سياسة الخصوصية
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
