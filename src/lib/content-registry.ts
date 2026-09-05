// Central registry of every editable content block on the site. Each block
// maps a `site_content` key → editable fields. Pages read their copy via
// getContent(key, fallback); the admin Content Studio renders one card per
// block here. To make a new section editable: add a block below and call
// getContent(key, fallback) where the section renders.

export type ContentField = {
  name: string;
  label: string;
  multiline?: boolean;
};

export type ContentBlock = {
  key: string;
  group: string; // page/area the block belongs to
  title: string;
  description?: string;
  fields: ContentField[];
};

export const CONTENT_GROUPS = [
  "الصفحة الرئيسية",
  "التذييل والتواصل",
  "صفحات داخلية",
] as const;

export const CONTENT_REGISTRY: ContentBlock[] = [
  // ---- Home page --------------------------------------------------------
  {
    key: "home.hero",
    group: "الصفحة الرئيسية",
    title: "القسم الرئيسي (Hero)",
    description: "العنوان والوصف وزر الدعوة في أعلى الصفحة الرئيسية.",
    fields: [
      { name: "titleTop", label: "العنوان (الجزء الأبيض)" },
      { name: "titleAccent", label: "العنوان (الكلمة المميّزة)" },
      { name: "subtitle", label: "الوصف", multiline: true },
      { name: "cta", label: "نص الزر" },
    ],
  },
  {
    key: "home.stats",
    group: "الصفحة الرئيسية",
    title: "الأرقام (الإحصائيات)",
    description: "الإحصائيات المعروضة أسفل القسم الرئيسي.",
    fields: [
      { name: "partners", label: "عدد الشركاء" },
      { name: "volume", label: "حجم التداول" },
      { name: "countries", label: "عدد الدول" },
      { name: "payout", label: "الأرباح المدفوعة" },
    ],
  },
  {
    key: "home.cta",
    group: "الصفحة الرئيسية",
    title: "قسم الدعوة الختامي (CTA)",
    description: "الشريط الأخير الذي يدعو الزائر لإنشاء حساب شريك.",
    fields: [
      { name: "heading", label: "العنوان" },
      { name: "subheading", label: "الوصف", multiline: true },
      { name: "button", label: "نص الزر" },
    ],
  },
  {
    key: "home.features",
    group: "الصفحة الرئيسية",
    title: "قسم المزايا — العنوان",
    description: "عنوان ووصف قسم «كل ما تحتاجه لتنمية أرباحك».",
    fields: [
      { name: "title", label: "العنوان" },
      { name: "subtitle", label: "الوصف", multiline: true },
    ],
  },
  {
    key: "home.steps",
    group: "الصفحة الرئيسية",
    title: "قسم الخطوات — العنوان",
    description: "عنوان ووصف قسم «ابدأ الشراكة في ٣ خطوات».",
    fields: [
      { name: "title", label: "العنوان" },
      { name: "subtitle", label: "الوصف", multiline: true },
    ],
  },
  {
    key: "home.faq",
    group: "الصفحة الرئيسية",
    title: "قسم الأسئلة الشائعة — العنوان",
    description: "عنوان ووصف قسم الأسئلة الشائعة.",
    fields: [
      { name: "title", label: "العنوان" },
      { name: "subtitle", label: "الوصف", multiline: true },
    ],
  },
  {
    key: "home.about",
    group: "الصفحة الرئيسية",
    title: "قسم «من نحن»",
    description: "الشارة والعنوان والنص التعريفي لقسم من نحن.",
    fields: [
      { name: "badge", label: "الشارة" },
      { name: "heading", label: "العنوان" },
      { name: "body", label: "النص", multiline: true },
    ],
  },

  // ---- Footer & contact -------------------------------------------------
  {
    key: "site.footer",
    group: "التذييل والتواصل",
    title: "التذييل (Footer)",
    description: "الجملة التعريفية أسفل شعار الموقع في التذييل.",
    fields: [{ name: "tagline", label: "الجملة التعريفية", multiline: true }],
  },
  {
    key: "site.contact",
    group: "التذييل والتواصل",
    title: "بيانات التواصل",
    description: "البريد والهاتف وساعات العمل المعروضة في صفحة اتصل بنا.",
    fields: [
      { name: "email", label: "البريد الإلكتروني" },
      { name: "phone", label: "الهاتف" },
      { name: "hours", label: "ساعات العمل" },
    ],
  },

  // ---- Inner pages ------------------------------------------------------
  {
    key: "affiliates.rates",
    group: "صفحات داخلية",
    title: "صفحة الوكلاء — النسب",
    description: "أرقام العمولات المعروضة في صفحة الوكلاء.",
    fields: [
      { name: "revenue_share", label: "Revenue Share" },
      { name: "cpa", label: "CPA" },
      { name: "sub_ib", label: "Sub-IB" },
    ],
  },
  {
    key: "page.compare",
    group: "صفحات داخلية",
    title: "صفحة المقارنة — العنوان",
    description: "عنوان ووصف أعلى صفحة مقارنة الشركات.",
    fields: [
      { name: "title", label: "العنوان" },
      { name: "subtitle", label: "الوصف", multiline: true },
    ],
  },
  {
    key: "page.spreads",
    group: "صفحات داخلية",
    title: "صفحة السبريد — العنوان",
    description: "عنوان ووصف أعلى صفحة مقارنة السبريد.",
    fields: [
      { name: "title", label: "العنوان" },
      { name: "subtitle", label: "الوصف", multiline: true },
    ],
  },
];

export function blockByKey(key: string): ContentBlock | undefined {
  return CONTENT_REGISTRY.find((b) => b.key === key);
}
