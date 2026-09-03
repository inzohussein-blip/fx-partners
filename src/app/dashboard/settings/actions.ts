"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validators";

type ActionResult = { ok: boolean; error?: string };

/** Update the current partner's own profile (RLS restricts to self). */
export async function updateProfile(input: unknown): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "غير مصرّح" };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name || null,
      company_name: parsed.data.company_name || null,
      country: parsed.data.country || null,
      phone: parsed.data.phone || null,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/settings");
  return { ok: true };
}
