/**
 * Guides to the economic releases that move forex and gold most.
 *
 * Everything here is original explanation plus each release's published
 * schedule rules (who issues it, how often, at what local time). No figures,
 * no forecasts and no copied calendar data: exact dates come from the issuing
 * agency, which every guide links to, and live dates from TradingView's
 * calendar widget on the page. Keep it that way — calendar data from third
 * parties is licensed, see docs and lib/tradingview.ts.
 */

type Text = { ar: string; en: string };
type List = { ar: string[]; en: string[] };

export type Indicator = {
  slug: string;
  /** Short name as traders say it: CPI, NFP, FOMC. */
  code: string;
  name: Text;
  agency: Text;
  frequency: Text;
  /** When in the month/year it is released, as the agency schedules it. */
  when: Text;
  /** Release time in the issuer's time zone, then in Mecca/Riyadh time. */
  time: Text;
  summary: Text;
  what: Text;
  why: Text;
  watch: List;
  affects: string[];
  official: { label: Text; url: string };
  /** TradingView calendar country filter for the widget on the page. */
  tvCountry: string;
  related: string[];
};

// US releases at 8:30 New York time land at 15:30 in Riyadh while the US is
// on daylight time (second Sunday of March to first Sunday of November) and
// at 16:30 the rest of the year. Riyadh keeps UTC+3 all year.
const US_0830: Text = {
  ar: "8:30 صباحاً بتوقيت نيويورك، أي 15:30 بتوقيت مكة في التوقيت الصيفي الأمريكي (من مارس إلى نوفمبر) و16:30 في الشتاء.",
  en: "8:30 a.m. New York time: 15:30 in Mecca/Riyadh while the US is on daylight time (March to November), 16:30 otherwise.",
};

export const INDICATORS: Indicator[] = [
  {
    slug: "cpi",
    code: "CPI",
    name: { ar: "مؤشر أسعار المستهلك الأمريكي (CPI)", en: "US Consumer Price Index (CPI)" },
    agency: { ar: "مكتب إحصاءات العمل الأمريكي (BLS)", en: "US Bureau of Labor Statistics (BLS)" },
    frequency: { ar: "شهري", en: "Monthly" },
    when: {
      ar: "عادةً في منتصف الشهر تقريباً، عن أسعار الشهر السابق. الموعد الدقيق في جدول المكتب.",
      en: "Usually around the middle of the month, for the previous month's prices. Exact dates are on the BLS schedule.",
    },
    time: US_0830,
    summary: {
      ar: "أهم قراءة للتضخم في أمريكا، وأكثر خبر يحرّك توقعات الفائدة، ومعها الدولار والذهب.",
      en: "America's headline inflation reading, and the release that moves rate expectations — and with them the dollar and gold — most.",
    },
    what: {
      ar: "يقيس تغيّر أسعار سلة من السلع والخدمات التي يشتريها المستهلك الأمريكي. يُنشر رقمان: المؤشر العام، والمؤشر الأساسي (Core) الذي يستبعد الغذاء والطاقة لأنهما الأكثر تقلباً. ويُقرأ كل منهما كتغيّر شهري وسنوي.",
      en: "It tracks the price of a basket of goods and services US consumers buy. Two figures are published: headline CPI, and core CPI, which leaves out food and energy because they swing the most. Each is read month-on-month and year-on-year.",
    },
    why: {
      ar: "الاحتياطي الفيدرالي يرفع الفائدة أو يخفضها بناءً على التضخم. لذلك قراءة أعلى من المتوقع ترفع غالباً احتمال فائدة أعلى، فيقوى الدولار وتضعف أسعار الذهب. والقراءة الأقل من المتوقع تفعل العكس غالباً. الحركة تأتي من الفرق بين الرقم الفعلي والتوقع، لا من الرقم وحده.",
      en: "The Federal Reserve sets rates around inflation, so a hotter-than-expected print usually raises the odds of higher rates: the dollar tends to rise and gold to fall, and a cooler print tends to do the opposite. What moves the market is the gap between the actual figure and the forecast, not the figure alone.",
    },
    watch: {
      ar: [
        "المؤشر الأساسي الشهري (Core m/m) هو الذي يركّز عليه السوق أكثر.",
        "الفرق بين الرقم الفعلي ومتوسط التوقعات المنشور في المفكرة.",
        "تعديلات الأشهر السابقة إن وُجدت.",
      ],
      en: [
        "Core CPI month-on-month is the figure markets weigh most.",
        "The gap between the actual figure and the consensus shown in the calendar.",
        "Any revisions to earlier months.",
      ],
    },
    affects: ["USD", "XAUUSD", "EURUSD", "USDJPY", "US500"],
    official: {
      label: { ar: "جدول مواعيد CPI من مكتب إحصاءات العمل", en: "BLS CPI release schedule" },
      url: "https://www.bls.gov/schedule/news_release/cpi.htm",
    },
    tvCountry: "us",
    related: ["pce", "fomc", "nfp"],
  },
  {
    slug: "nfp",
    code: "NFP",
    name: { ar: "الوظائف غير الزراعية الأمريكية (NFP)", en: "US Non-Farm Payrolls (NFP)" },
    agency: { ar: "مكتب إحصاءات العمل الأمريكي (BLS) — تقرير «Employment Situation»", en: "US Bureau of Labor Statistics (BLS) — the Employment Situation report" },
    frequency: { ar: "شهري", en: "Monthly" },
    when: {
      ar: "عادةً أول يوم جمعة من الشهر، عن الشهر السابق. قد يتغيّر بسبب العطلات، فراجع جدول المكتب.",
      en: "Usually the first Friday of the month, for the previous month. Holidays can move it, so check the BLS schedule.",
    },
    time: US_0830,
    summary: {
      ar: "تقرير سوق العمل الأمريكي الشهري، ومن أقوى الأخبار تأثيراً وأكثرها تقلباً في الأسعار.",
      en: "The monthly US jobs report, and one of the most market-moving and volatile releases of the month.",
    },
    what: {
      ar: "يقيس عدد الوظائف التي أُضيفت أو فُقدت خارج القطاع الزراعي خلال الشهر. ويصدر معه في التقرير نفسه معدل البطالة ومتوسط الأجر في الساعة.",
      en: "It counts the jobs added or lost outside farming during the month. The same report carries the unemployment rate and average hourly earnings.",
    },
    why: {
      ar: "سوق العمل القوي يعني اقتصاداً قوياً وضغطاً على الأجور والتضخم، وهذا يدعم بقاء الفائدة مرتفعة. لذلك يقرؤه السوق مع CPI لتوقّع قرار الفيدرالي القادم. والأرقام الثلاثة معاً قد تعطي إشارات متعاكسة، فتكثر التقلبات الحادة في الدقائق الأولى.",
      en: "A strong labour market means a strong economy and pressure on wages and inflation, which argues for keeping rates high, so markets read it alongside CPI to guess the Fed's next move. The three headline numbers can point in different directions, which is why the first minutes are often whipsaw.",
    },
    watch: {
      ar: [
        "عدد الوظائف مقارنة بالتوقع.",
        "متوسط الأجر في الساعة: مؤشر مبكر على التضخم.",
        "معدل البطالة، وتعديلات أرقام الشهرين السابقين.",
      ],
      en: [
        "Payrolls against the forecast.",
        "Average hourly earnings — an early read on inflation.",
        "The unemployment rate, and revisions to the previous two months.",
      ],
    },
    affects: ["USD", "XAUUSD", "EURUSD", "GBPUSD", "USDJPY"],
    official: {
      label: { ar: "جدول مواعيد تقرير الوظائف من مكتب إحصاءات العمل", en: "BLS Employment Situation schedule" },
      url: "https://www.bls.gov/schedule/news_release/empsit.htm",
    },
    tvCountry: "us",
    related: ["cpi", "fomc", "ism-pmi"],
  },
  {
    slug: "fomc",
    code: "FOMC",
    name: { ar: "قرار الفائدة الأمريكية (FOMC)", en: "US interest-rate decision (FOMC)" },
    agency: { ar: "لجنة السوق المفتوحة في الاحتياطي الفيدرالي", en: "The Federal Reserve's Federal Open Market Committee" },
    frequency: { ar: "ثمانية اجتماعات مجدولة في السنة", en: "Eight scheduled meetings a year" },
    when: {
      ar: "تُعلَن مواعيد الاجتماعات مسبقاً لسنة كاملة على موقع الفيدرالي. يصدر القرار في اليوم الثاني من الاجتماع.",
      en: "Meeting dates are published a year ahead on the Fed's website. The decision comes on the meeting's second day.",
    },
    time: {
      ar: "البيان 2:00 ظهراً بتوقيت نيويورك (21:00 بتوقيت مكة في التوقيت الصيفي الأمريكي، و22:00 في الشتاء)، ثم المؤتمر الصحفي بعد نصف ساعة.",
      en: "Statement at 2:00 p.m. New York time (21:00 Mecca/Riyadh on US daylight time, 22:00 otherwise), press conference half an hour later.",
    },
    summary: {
      ar: "أهم حدث في جدول الفوركس: قرار سعر الفائدة على الدولار، وما يقوله رئيس الفيدرالي عن الخطوة التالية.",
      en: "The biggest event on the forex calendar: the dollar's interest rate, and what the Fed chair says about the next step.",
    },
    what: {
      ar: "تحدّد اللجنة النطاق المستهدف لسعر الفائدة الأمريكي. ويصدر مع القرار بيان مكتوب، ثم مؤتمر صحفي لرئيس الفيدرالي. وفي أربعة اجتماعات من الثمانية تُنشر أيضاً توقعات الأعضاء للفائدة والاقتصاد (مخطط النقاط Dot Plot). وتُنشر محاضر الاجتماع بعد نحو ثلاثة أسابيع.",
      en: "The committee sets the target range for US interest rates. A written statement comes with the decision, followed by the chair's press conference. At four of the eight meetings members also publish their projections for rates and the economy (the dot plot). Minutes follow about three weeks later.",
    },
    why: {
      ar: "الفائدة هي العائد على حيازة الدولار، فأي تغيير فيها أو في توقعاتها يعيد تسعير كل أزواج الدولار والذهب والمؤشرات. وكثيراً ما يكون القرار نفسه متوقعاً، فتأتي الحركة الكبرى من لهجة البيان والمؤتمر الصحفي.",
      en: "Rates are the return on holding dollars, so any change — or change in expectations — reprices every dollar pair, gold and the indices. The decision itself is often expected; the big move tends to come from the tone of the statement and the press conference.",
    },
    watch: {
      ar: [
        "هل جاء القرار كما يتوقع السوق؟",
        "تغيّر صياغة البيان عن الاجتماع السابق.",
        "مخطط النقاط في اجتماعات التوقعات، وإجابات رئيس الفيدرالي في المؤتمر.",
      ],
      en: [
        "Whether the decision matched what markets priced in.",
        "How the statement's wording changed from the last meeting.",
        "The dot plot at projection meetings, and the chair's answers at the press conference.",
      ],
    },
    affects: ["USD", "XAUUSD", "EURUSD", "USDJPY", "US500"],
    official: {
      label: { ar: "تقويم اجتماعات الفيدرالي الرسمي", en: "Federal Reserve FOMC calendar" },
      url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
    },
    tvCountry: "us",
    related: ["cpi", "pce", "nfp"],
  },
  {
    slug: "pce",
    code: "PCE",
    name: { ar: "مؤشر نفقات الاستهلاك الشخصي (PCE)", en: "Personal Consumption Expenditures price index (PCE)" },
    agency: { ar: "مكتب التحليل الاقتصادي الأمريكي (BEA) — تقرير «Personal Income and Outlays»", en: "US Bureau of Economic Analysis (BEA) — the Personal Income and Outlays report" },
    frequency: { ar: "شهري", en: "Monthly" },
    when: {
      ar: "عادةً قرب نهاية الشهر، عن الشهر السابق. الموعد في جدول المكتب.",
      en: "Usually near the end of the month, for the previous month. Dates are on the BEA schedule.",
    },
    time: US_0830,
    summary: {
      ar: "مقياس التضخم الذي يفضّله الاحتياطي الفيدرالي، وهدفه 2% يُقاس عليه.",
      en: "The inflation gauge the Federal Reserve prefers; its 2% target is defined on it.",
    },
    what: {
      ar: "يقيس تغيّر أسعار كل ما ينفقه المستهلكون الأمريكيون أو يُنفق عنهم. ويُنشر منه رقم عام ورقم أساسي (Core PCE) بلا غذاء وطاقة، مع بيانات الدخل والإنفاق الشخصي.",
      en: "It measures prices across everything US consumers spend on or is spent on their behalf, with a headline and a core (ex food and energy) figure, alongside personal income and spending.",
    },
    why: {
      ar: "لأن الفيدرالي يحدد هدف التضخم على هذا المؤشر، فالمؤشر الأساسي منه يؤثّر مباشرة على توقعات الفائدة. لكنه يصدر بعد CPI، فيكون السوق قد توقّع جزءاً منه، ولذلك تكون الحركة غالباً أهدأ.",
      en: "Because the Fed defines its target on this measure, core PCE feeds straight into rate expectations. It comes out after CPI, though, so markets have partly anticipated it and the reaction is often smaller.",
    },
    watch: {
      ar: [
        "Core PCE الشهري والسنوي مقارنة بالتوقع.",
        "الإنفاق الشخصي: مقياس لقوة الطلب.",
      ],
      en: [
        "Core PCE month-on-month and year-on-year against the forecast.",
        "Personal spending, as a read on demand.",
      ],
    },
    affects: ["USD", "XAUUSD", "EURUSD"],
    official: {
      label: { ar: "جدول إصدارات مكتب التحليل الاقتصادي", en: "BEA release schedule" },
      url: "https://www.bea.gov/news/schedule",
    },
    tvCountry: "us",
    related: ["cpi", "fomc", "gdp"],
  },
  {
    slug: "gdp",
    code: "GDP",
    name: { ar: "الناتج المحلي الإجمالي الأمريكي (GDP)", en: "US Gross Domestic Product (GDP)" },
    agency: { ar: "مكتب التحليل الاقتصادي الأمريكي (BEA)", en: "US Bureau of Economic Analysis (BEA)" },
    frequency: { ar: "ربع سنوي، بثلاث تقديرات لكل ربع", en: "Quarterly, in three estimates per quarter" },
    when: {
      ar: "التقدير الأول (Advance) بعد نحو شهر من نهاية الربع، ثم تقديران مُعدَّلان في الشهرين التاليين.",
      en: "The advance estimate about a month after the quarter ends, then two revised estimates in the following months.",
    },
    time: US_0830,
    summary: {
      ar: "أوسع مقياس لحجم الاقتصاد الأمريكي ونموّه، ويحرّك السوق أكثر في تقديره الأول.",
      en: "The broadest measure of the size and growth of the US economy; it moves markets most on its first estimate.",
    },
    what: {
      ar: "يقيس قيمة كل السلع والخدمات المنتجة في أمريكا خلال الربع. ويُعلَن عادةً كنسبة نمو سنوية معدّلة موسمياً (annualized).",
      en: "It measures the value of all goods and services produced in the US during the quarter, usually reported as a seasonally adjusted annualised growth rate.",
    },
    why: {
      ar: "النمو القوي يدعم الدولار وقد يؤخّر خفض الفائدة، والنمو الضعيف أو السلبي يثير الحديث عن ركود. التقدير الأول هو المفاجأة الأكبر، والتعديلات اللاحقة أقل تأثيراً عادةً.",
      en: "Strong growth supports the dollar and can delay rate cuts; weak or negative growth raises recession talk. The advance estimate is the biggest surprise; later revisions usually matter less.",
    },
    watch: {
      ar: ["التقدير الأول مقارنة بالتوقع.", "مؤشر الأسعار المصاحب للناتج (GDP price index)."],
      en: ["The advance estimate against the forecast.", "The accompanying GDP price index."],
    },
    affects: ["USD", "US500", "XAUUSD"],
    official: {
      label: { ar: "جدول إصدارات مكتب التحليل الاقتصادي", en: "BEA release schedule" },
      url: "https://www.bea.gov/news/schedule",
    },
    tvCountry: "us",
    related: ["pce", "retail-sales", "ism-pmi"],
  },
  {
    slug: "ism-pmi",
    code: "ISM PMI",
    name: { ar: "مؤشر مديري المشتريات الصناعي الأمريكي (ISM PMI)", en: "US ISM Manufacturing PMI" },
    agency: { ar: "معهد إدارة التوريد الأمريكي (ISM)", en: "Institute for Supply Management (ISM)" },
    frequency: { ar: "شهري", en: "Monthly" },
    when: {
      ar: "المؤشر الصناعي في أول يوم عمل من الشهر، ومؤشر الخدمات بعده بيومي عمل تقريباً.",
      en: "Manufacturing on the first business day of the month; services a couple of business days later.",
    },
    time: {
      ar: "10:00 صباحاً بتوقيت نيويورك (17:00 بتوقيت مكة في التوقيت الصيفي الأمريكي، و18:00 في الشتاء).",
      en: "10:00 a.m. New York time (17:00 Mecca/Riyadh on US daylight time, 18:00 otherwise).",
    },
    summary: {
      ar: "استطلاع شهري لمديري المشتريات في الشركات، وأول قراءة لحال الاقتصاد في كل شهر.",
      en: "A monthly survey of company purchasing managers — the first read on the economy each month.",
    },
    what: {
      ar: "مؤشر من 0 إلى 100 مبني على إجابات الشركات عن الطلبات الجديدة والإنتاج والتوظيف والأسعار. فوق 50 يعني توسّع النشاط، وتحت 50 يعني انكماشه.",
      en: "A 0–100 index built from companies' answers on new orders, output, employment and prices. Above 50 means activity is expanding; below 50, contracting.",
    },
    why: {
      ar: "لأنه يصدر في أول الشهر قبل البيانات الرسمية، يستعمله السوق مؤشراً مبكراً. ومكوّن الأسعار فيه يُقرأ كإشارة مبكرة على التضخم.",
      en: "Coming out at the start of the month, ahead of official data, it works as an early indicator. Its prices component is read as an early inflation signal.",
    },
    watch: {
      ar: ["هل المؤشر فوق 50 أم تحتها، واتجاهه.", "مكوّنا الطلبات الجديدة والأسعار."],
      en: ["Whether the index is above or below 50, and its direction.", "The new-orders and prices components."],
    },
    affects: ["USD", "US500", "XAUUSD"],
    official: {
      label: { ar: "تقويم تقارير ISM الرسمي", en: "ISM Report On Business calendar" },
      url: "https://www.ismworld.org/supply-management-news-and-reports/reports/rob-report-calendar/",
    },
    tvCountry: "us",
    related: ["nfp", "gdp", "retail-sales"],
  },
  {
    slug: "retail-sales",
    code: "Retail Sales",
    name: { ar: "مبيعات التجزئة الأمريكية", en: "US Retail Sales" },
    agency: { ar: "مكتب الإحصاء الأمريكي (Census Bureau)", en: "US Census Bureau" },
    frequency: { ar: "شهري", en: "Monthly" },
    when: {
      ar: "عادةً في منتصف الشهر تقريباً، عن الشهر السابق.",
      en: "Usually around the middle of the month, for the previous month.",
    },
    time: US_0830,
    summary: {
      ar: "قراءة شهرية لإنفاق المستهلك الأمريكي، وهو الجزء الأكبر من الاقتصاد الأمريكي.",
      en: "A monthly read on US consumer spending, the largest part of the US economy.",
    },
    what: {
      ar: "يقيس تغيّر قيمة مبيعات متاجر التجزئة والمطاعم خلال الشهر. ويُنشر رقم عام وأرقام تستبعد السيارات أو الوقود، ومنها «مجموعة التحكم» (Control group) التي تدخل في حساب الناتج المحلي.",
      en: "It measures the change in sales at retailers and restaurants over the month, with a headline figure and versions excluding autos or gasoline — including the control group that feeds into GDP.",
    },
    why: {
      ar: "إنفاق المستهلك القوي يدعم النمو والتضخم والدولار، والضعيف يشير إلى تباطؤ. والرقم يُعدَّل كثيراً في الشهر التالي.",
      en: "Strong spending supports growth, inflation and the dollar; weak spending points to a slowdown. The figure is often revised the following month.",
    },
    watch: {
      ar: ["مجموعة التحكم أكثر من الرقم العام.", "تعديل رقم الشهر السابق."],
      en: ["The control group more than the headline.", "The revision to the prior month."],
    },
    affects: ["USD", "US500"],
    official: {
      label: { ar: "تقويم المؤشرات الاقتصادية من مكتب الإحصاء", en: "Census Bureau economic indicator calendar" },
      url: "https://www.census.gov/economic-indicators/calendar-listview.html",
    },
    tvCountry: "us",
    related: ["gdp", "cpi", "ism-pmi"],
  },
  {
    slug: "ecb",
    code: "ECB",
    name: { ar: "قرار الفائدة الأوروبية (ECB)", en: "ECB interest-rate decision" },
    agency: { ar: "مجلس محافظي البنك المركزي الأوروبي", en: "The European Central Bank's Governing Council" },
    frequency: { ar: "كل ستة أسابيع تقريباً (ثمانية اجتماعات في السنة)", en: "Roughly every six weeks (eight meetings a year)" },
    when: {
      ar: "تُنشر مواعيد اجتماعات السياسة النقدية مسبقاً على موقع البنك.",
      en: "Monetary-policy meeting dates are published in advance on the ECB website.",
    },
    time: {
      ar: "القرار 14:15 بتوقيت فرانكفورت، والمؤتمر الصحفي 14:45. بتوقيت مكة: 15:15 في التوقيت الصيفي الأوروبي (من نهاية مارس إلى نهاية أكتوبر)، و16:15 في الشتاء.",
      en: "Decision at 14:15 Frankfurt time, press conference at 14:45. In Mecca/Riyadh: 15:15 during European summer time (late March to late October), 16:15 otherwise.",
    },
    summary: {
      ar: "قرار الفائدة على اليورو، وأهم حدث لزوج EUR/USD بعد قرارات الفيدرالي.",
      en: "The euro's interest-rate decision — the biggest event for EUR/USD after the Fed's.",
    },
    what: {
      ar: "يحدّد البنك أسعار الفائدة الرئيسية في منطقة اليورو، ثم يُشرح القرار في مؤتمر صحفي لرئاسة البنك. وفي بعض الاجتماعات تُنشر توقعات البنك للتضخم والنمو.",
      en: "The bank sets the euro area's key interest rates, and its president explains the decision at a press conference. Some meetings also bring the bank's staff projections for inflation and growth.",
    },
    why: {
      ar: "الفرق بين فائدة اليورو وفائدة الدولار هو المحرّك الأكبر لزوج EUR/USD. لذلك أي مفاجأة في القرار أو في إشارات المؤتمر تحرّك اليورو أمام كل العملات.",
      en: "The gap between euro and dollar rates is the biggest driver of EUR/USD, so any surprise in the decision or the press conference moves the euro across the board.",
    },
    watch: {
      ar: ["هل جاء القرار كما يتوقع السوق؟", "إشارات المؤتمر الصحفي عن الاجتماعات القادمة.", "توقعات التضخم في اجتماعات التوقعات."],
      en: ["Whether the decision matched expectations.", "Guidance at the press conference about coming meetings.", "Inflation projections at projection meetings."],
    },
    affects: ["EUR", "EURUSD", "EURGBP", "EURJPY", "DE40"],
    official: {
      label: { ar: "تقويم اجتماعات البنك المركزي الأوروبي", en: "ECB meeting calendar" },
      url: "https://www.ecb.europa.eu/press/calendars/mgcgc/html/index.en.html",
    },
    tvCountry: "eu",
    related: ["fomc", "cpi", "pce"],
  },
];

export function indicatorBySlug(slug: string): Indicator | undefined {
  return INDICATORS.find((i) => i.slug === slug);
}

export function pick(t: Text, locale: string): string {
  return locale === "ar" ? t.ar : t.en;
}

export function pickList(l: List, locale: string): string[] {
  return locale === "ar" ? l.ar : l.en;
}
