import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Connection diagnostic for the Supabase-backed sections.
 *
 * The public pages fail soft — a missing env var, an empty table and an RLS
 * policy that blocks anonymous reads all render as "no brokers yet", which
 * makes the real cause impossible to tell apart from the outside. This
 * endpoint separates them.
 *
 * It deliberately reports only booleans, counts and the Postgres error code —
 * never the project URL, keys, or row contents.
 */
export async function GET() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!configured) {
    // The commonest failure by far: the values are set, but under the
    // un-prefixed names. Next.js only exposes NEXT_PUBLIC_* to the browser and
    // the app reads the prefixed names, so un-prefixed ones are invisible here.
    const unprefixed = {
      SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
      SUPABASE_ANON_KEY: Boolean(process.env.SUPABASE_ANON_KEY),
    };
    const misprefixed = unprefixed.SUPABASE_URL || unprefixed.SUPABASE_ANON_KEY;

    return NextResponse.json(
      {
        configured: false,
        missing: {
          NEXT_PUBLIC_SUPABASE_URL: !process.env.NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY:
            !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        foundUnprefixed: misprefixed ? unprefixed : undefined,
        diagnosis: misprefixed
          ? "The values exist but under the wrong names: SUPABASE_URL / SUPABASE_ANON_KEY are set, while the app reads NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Rename them in Vercel (keep the same values) and redeploy. Leave SUPABASE_SERVICE_ROLE_KEY un-prefixed — it must never reach the browser."
          : "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not present in this build. Add them in Vercel → Settings → Environment Variables (Production) and redeploy — NEXT_PUBLIC_* vars are inlined at build time, so adding them without a rebuild changes nothing.",
      },
      { headers: { "cache-control": "no-store" } }
    );
  }

  try {
    const supabase = createClient();

    const total = await supabase
      .from("brokers")
      .select("*", { count: "exact", head: true });

    const published = await supabase
      .from("brokers")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true);

    const err = total.error ?? published.error;
    if (err) {
      return NextResponse.json(
        {
          configured: true,
          canQuery: false,
          errorCode: err.code ?? null,
          errorMessage: err.message,
          diagnosis:
            "Supabase is reachable but the anonymous read failed — usually a Row Level Security policy. The site reads as the anon role, so `brokers` needs a policy allowing SELECT to anon.",
        },
        { headers: { "cache-control": "no-store" } }
      );
    }

    const totalCount = total.count ?? 0;
    const publishedCount = published.count ?? 0;

    return NextResponse.json(
      {
        configured: true,
        canQuery: true,
        brokersTotal: totalCount,
        brokersPublished: publishedCount,
        diagnosis:
          publishedCount > 0
            ? "Connected, and published brokers are visible. The site sections should render."
            : totalCount > 0
              ? "Connected, but no row has is_published = true — the site only shows published brokers."
              : "Connected, but the brokers table is empty. Add brokers from the admin dashboard.",
      },
      { headers: { "cache-control": "no-store" } }
    );
  } catch (e) {
    return NextResponse.json(
      {
        configured: true,
        canQuery: false,
        errorMessage: e instanceof Error ? e.message : String(e),
        diagnosis: "Creating the Supabase client threw — the URL or anon key is likely malformed.",
      },
      { headers: { "cache-control": "no-store" } }
    );
  }
}
