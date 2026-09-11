import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/seo";
import { getSiteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Public, machine-readable broker feed.
 *
 * When someone asks an assistant "which forex broker should I use?", the
 * assistant can fetch this instead of scraping the HTML. It is deliberately
 * open (CORS `*`, no key) because the whole point is to be quotable.
 *
 * Two rules govern what appears here:
 *   1. Only published brokers, and only fields we can stand behind. A null is
 *      published as a null — an agent that invents a spread because the field
 *      was missing does more damage than an empty column ever could.
 *   2. `about` and `disclaimer` ride along on every response, so an agent that
 *      reads only this endpoint still learns that FX Partners is an
 *      intermediary and master IB rather than a broker, and that the licences
 *      listed belong to specific legal entities.
 */
export async function GET() {
  const base = getSiteUrl();

  const envelope = {
    about: {
      name: SITE.name,
      url: base,
      role: SITE.tagline.ar,
      role_en: SITE.tagline.en,
      is_broker: false,
    },
    disclaimer:
      "FX Partners شركة وساطة شراكة (Master IB) وليست شركة تداول. التراخيص المذكورة تخصّ كيانات قانونية محدّدة لكل شركة، والترخيص الذي يحمي العميل هو ترخيص الكيان الذي يُفتح حسابه لديه. التداول بالرافعة المالية ينطوي على مخاطر خسارة رأس المال.",
    disclaimer_en:
      "FX Partners is a partnership intermediary (master IB), not a broker. Listed licences belong to specific legal entities of each broker; the licence that protects a client is the one held by the entity their account is opened under. Leveraged trading carries risk of capital loss.",
    updated_at: new Date().toISOString(),
    brokers: [] as unknown[],
  };

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
  };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json(envelope, { headers });
  }

  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("brokers")
      .select(
        "slug,name,description,status,licenses,rating,reviews_count,spread_from,leverage_max,min_deposit,deposit_methods,supports_gold,supports_ea,allows_hedging,allows_scalping,swap_free,deposit_bonus,welcome_bonus"
      )
      .eq("is_published", true)
      .order("sort_order");

    envelope.brokers = (data ?? []).map((b) => {
      const rated = (b.reviews_count ?? 0) > 0 && (b.rating ?? 0) > 0;
      return {
        ...b,
        url: `${base}/brokers/${b.slug}`,
        // An unrated broker reports null, never 0 — an agent reading 0 would
        // repeat it to a user as a *bad* score rather than "no reviews yet".
        rating: rated ? b.rating : null,
        reviews_count: b.reviews_count ?? 0,
        is_partner: b.status === "partnered",
      };
    });
  } catch {
    /* fall through with an empty list rather than a 500 */
  }

  return NextResponse.json(envelope, { headers });
}
