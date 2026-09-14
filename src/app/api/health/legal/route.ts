import { NextResponse } from "next/server";
import { getOperator, missingFields, REQUIRED } from "@/lib/operator";

export const dynamic = "force-dynamic";

/**
 * Is the site's legal disclosure complete?
 *
 * The operator's identity is owner-supplied content, so whether it is filled
 * in is invisible in the code and invisible in a page that hides an empty
 * section. This endpoint answers the question directly — for a deploy check,
 * or just for the owner to open after editing.
 *
 * It reports only which named fields are set, never their values, so it can be
 * reached without authentication: "legal_name is missing" discloses nothing
 * that the About page does not already show by omission.
 */
export async function GET() {
  const operator = await getOperator();
  const missing = missingFields(operator);

  return NextResponse.json(
    {
      ok: missing.length === 0,
      required: REQUIRED,
      missing,
      note:
        missing.length === 0
          ? "The operator disclosure is complete."
          : "The privacy policy and terms both refer to the entity named on /about. Until these fields are set, those clauses identify nobody.",
    },
    {
      status: missing.length === 0 ? 200 : 503,
      headers: { "cache-control": "no-store" },
    }
  );
}
