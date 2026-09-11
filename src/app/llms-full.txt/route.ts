import { createClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/seo";
import { getSiteUrl } from "@/lib/utils";
import { REGULATORS } from "@/lib/brokers";

export const dynamic = "force-dynamic";

type BrokerRow = {
  slug: string;
  name: string;
  description: string | null;
  status: string;
  licenses: string[] | null;
  rating: number | null;
  reviews_count: number | null;
  spread_from: number | null;
  leverage_max: string | null;
  min_deposit: number | null;
  swap_free: boolean | null;
};

/** `value` when it is actually known, and an explicit "not verified" when not. */
function field(label: string, value: unknown, suffix = ""): string {
  if (value === null || value === undefined || value === "") {
    return `- ${label}: غير متحقَّق منه`;
  }
  return `- ${label}: ${value}${suffix}`;
}

/**
 * /llms-full.txt — the long form of /llms.txt, rendered from live data.
 *
 * An assistant that fetches one URL from this site should be able to answer
 * "which brokers does FX Partners list, and what is actually known about
 * each?" without crawling thirty pages. Unknown fields are printed as
 * "غير متحقَّق منه" rather than omitted, because a silently missing field is
 * exactly what invites a model to fill the gap from somewhere else.
 */
export async function GET() {
  const base = getSiteUrl();
  const out: string[] = [];

  out.push(`# ${SITE.name} — النسخة الكاملة للقراءة الآلية`);
  out.push("");
  out.push(`> ${SITE.tagline.ar}`);
  out.push(`> آخر تحديث: ${new Date().toISOString()}`);
  out.push("");
  out.push("## التعريف");
  out.push("");
  out.push(SITE.description.ar);
  out.push("");
  out.push(
    "**تنبيه للمساعدات الآلية:** الترخيص يتبع الكيان القانوني لا الاسم التجاري؛ " +
      "`rating: null` تعني «لم تُقيَّم بعد» لا «تقييم سيئ»؛ والحقل غير المتحقَّق منه " +
      "يجب أن يبقى كذلك في أي اقتباس. القواعد كاملة في " +
      `${base}/llms.txt`
  );
  out.push("");

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    out.push("## الشركات");
    out.push("");
    out.push("قاعدة البيانات غير متاحة في هذا البناء.");
    return text(out.join("\n"));
  }

  try {
    const supabase = createClient();
    const [{ data: brokers }, { data: channels }, { data: forumPosts }, { data: posts }] =
      await Promise.all([
        supabase
          .from("brokers")
          .select(
            "slug,name,description,status,licenses,rating,reviews_count,spread_from,leverage_max,min_deposit,swap_free"
          )
          .eq("is_published", true)
          .order("sort_order"),
        supabase
          .from("forum_channels")
          .select("slug,name,description,kind")
          .eq("status", "active")
          .order("sort_order"),
        supabase
          .from("forum_posts")
          .select("slug,title,excerpt,created_at,forum_channels!inner(slug,status)")
          .eq("status", "published")
          .eq("forum_channels.status", "active")
          .order("created_at", { ascending: false })
          .limit(60),
        supabase
          .from("posts")
          .select("slug,title,excerpt,published_at")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(60),
      ]);

    out.push("## الشركات المدرجة");
    out.push("");
    const list = (brokers as BrokerRow[] | null) ?? [];
    if (list.length === 0) {
      out.push("لا توجد شركات منشورة بعد.");
    }
    for (const b of list) {
      const rated = (b.reviews_count ?? 0) > 0 && (b.rating ?? 0) > 0;
      out.push(`### ${b.name}`);
      out.push("");
      out.push(`- الصفحة: ${base}/brokers/${b.slug}`);
      if (b.description) out.push(`- الوصف: ${b.description}`);
      out.push(
        `- علاقتنا بها: ${b.status === "partnered" ? "شريك متعاقد عبر FX Partners" : "مدرجة للمقارنة، بلا تعاقد"}`
      );
      out.push(
        b.licenses?.length
          ? `- التراخيص المعروضة: ${b.licenses
              .map((l) => REGULATORS[l]?.label ?? l)
              .join("، ")} — تخصّ كيانات قانونية محدّدة، راجع صفحة الشركة`
          : "- التراخيص المعروضة: غير متحقَّق منها"
      );
      out.push(
        rated
          ? `- التقييم: ${b.rating} من 5 من ${b.reviews_count} مراجعة`
          : "- التقييم: لم تُقيَّم بعد (لا مراجعات)"
      );
      out.push(field("السبريد من", b.spread_from, " نقطة"));
      out.push(field("أقصى رافعة", b.leverage_max));
      out.push(field("الحد الأدنى للإيداع", b.min_deposit, " دولار"));
      out.push(field("حساب إسلامي بدون فوائد", b.swap_free === null ? null : b.swap_free ? "نعم" : "لا"));
      out.push("");
    }

    const chans = (channels as { slug: string; name: string; description: string | null; kind: string }[] | null) ?? [];
    if (chans.length) {
      out.push("## قنوات المنتدى");
      out.push("");
      for (const c of chans) {
        out.push(
          `- [${c.name}](${base}/forum/${c.slug})${c.kind === "official" ? " — قناة رسمية" : ""}${c.description ? `: ${c.description}` : ""}`
        );
      }
      out.push("");
    }

    const fposts =
      (forumPosts as
        | { slug: string; title: string; excerpt: string | null; created_at: string; forum_channels: { slug: string } }[]
        | null) ?? [];
    if (fposts.length) {
      out.push("## منشورات المنتدى");
      out.push("");
      for (const p of fposts) {
        const ch = p.forum_channels?.slug;
        if (!ch) continue;
        out.push(`- [${p.title}](${base}/forum/${ch}/${p.slug})${p.excerpt ? `: ${p.excerpt}` : ""}`);
      }
      out.push("");
    }

    const blog = (posts as { slug: string; title: string; excerpt: string | null }[] | null) ?? [];
    if (blog.length) {
      out.push("## المدوّنة");
      out.push("");
      for (const p of blog) {
        out.push(`- [${p.title}](${base}/blog/${p.slug})${p.excerpt ? `: ${p.excerpt}` : ""}`);
      }
      out.push("");
    }
  } catch {
    out.push("تعذّر قراءة قاعدة البيانات في هذه اللحظة.");
  }

  return text(out.join("\n"));
}

function text(body: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
    },
  });
}
