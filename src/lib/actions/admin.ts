"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: boolean; error?: string };

/** Ensure the current session belongs to an admin before mutating. */
async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, admin: false as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, admin: profile?.role === "admin" };
}

const IB_STATUSES = ["pending", "approved", "suspended", "rejected"] as const;
type IbStatus = (typeof IB_STATUSES)[number];

/** Approve / reject / suspend an IB account. */
export async function updateIbStatus(
  ibId: string,
  status: IbStatus
): Promise<ActionResult> {
  if (!IB_STATUSES.includes(status)) {
    return { ok: false, error: "حالة غير صالحة" };
  }

  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };

  const { error } = await supabase
    .from("ib_accounts")
    .update({ status })
    .eq("id", ibId);

  if (error) return { ok: false, error: error.message };

  // A newly approved IB needs a wallet row so the dashboard renders.
  if (status === "approved") {
    await supabase
      .from("wallets")
      .upsert({ ib_id: ibId }, { onConflict: "ib_id" });
  }

  revalidatePath("/dashboard/admin");
  return { ok: true };
}

const WD_STATUSES = ["pending", "processing", "paid", "rejected"] as const;
type WithdrawalStatus = (typeof WD_STATUSES)[number];

/** Move a withdrawal request through its lifecycle. */
export async function updateWithdrawalStatus(
  withdrawalId: string,
  status: WithdrawalStatus
): Promise<ActionResult> {
  if (!WD_STATUSES.includes(status)) {
    return { ok: false, error: "حالة غير صالحة" };
  }

  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };

  const { error } = await supabase
    .from("withdrawals")
    .update({ status })
    .eq("id", withdrawalId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/admin");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Content management: posts, site_content, partners
// ---------------------------------------------------------------------------

/** Turn a title (Arabic or Latin) into a URL-safe slug. */
function slugify(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[\s؀-ۿ]+/g, "-") // spaces + Arabic → dash
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || `post-${Date.now().toString(36)}`;
}

function revalidatePublic() {
  for (const p of [
    "/",
    "/affiliates",
    "/brokers",
    "/blog",
    "/compare",
    "/spreads",
    "/contact",
  ]) {
    revalidatePath(p);
  }
  // The footer (site.footer) renders on every marketing page.
  revalidatePath("/", "layout");
}

// ---- POSTS ----------------------------------------------------------------

export type PostInput = {
  id?: string;
  title: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  cover_image?: string;
  status: "draft" | "published" | "archived";
};

export async function savePost(input: PostInput): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  if (!input.title?.trim()) return { ok: false, error: "العنوان مطلوب" };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const row = {
    title: input.title.trim(),
    slug: (input.slug?.trim() || slugify(input.title)).toLowerCase(),
    excerpt: input.excerpt?.trim() || null,
    body: input.body ?? null,
    cover_image: input.cover_image?.trim() || null,
    status: input.status,
    author_id: user?.id ?? null,
    published_at:
      input.status === "published" ? new Date().toISOString() : null,
  };

  const query = input.id
    ? supabase.from("posts").update(row).eq("id", input.id)
    : supabase.from("posts").insert(row);

  const { error } = await query;
  if (error) return { ok: false, error: error.message };

  revalidatePublic();
  revalidatePath("/dashboard/admin/posts");
  return { ok: true };
}

export async function deletePost(id: string): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };

  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePublic();
  revalidatePath("/dashboard/admin/posts");
  return { ok: true };
}

// ---- SITE CONTENT ---------------------------------------------------------

export async function saveContent(
  key: string,
  value: Record<string, unknown>
): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  if (!key) return { ok: false, error: "المفتاح مطلوب" };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("site_content").upsert(
    { key, value, updated_by: user?.id ?? null, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );
  if (error) return { ok: false, error: error.message };

  revalidatePublic();
  revalidatePath("/dashboard/admin/content");
  return { ok: true };
}

// ---- PARTNERS -------------------------------------------------------------

export type PartnerInput = {
  id?: string;
  name: string;
  logo_url?: string;
  website?: string;
  description?: string;
  category?: string;
  sort_order?: number;
  is_active?: boolean;
};

export async function savePartner(input: PartnerInput): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  if (!input.name?.trim()) return { ok: false, error: "الاسم مطلوب" };

  const row = {
    name: input.name.trim(),
    logo_url: input.logo_url?.trim() || null,
    website: input.website?.trim() || null,
    description: input.description?.trim() || null,
    category: input.category?.trim() || "broker",
    sort_order: Number(input.sort_order ?? 0),
    is_active: input.is_active ?? true,
  };

  const query = input.id
    ? supabase.from("partners").update(row).eq("id", input.id)
    : supabase.from("partners").insert(row);

  const { error } = await query;
  if (error) return { ok: false, error: error.message };

  revalidatePath("/brokers");
  revalidatePath("/dashboard/admin/partners");
  return { ok: true };
}

export async function deletePartner(id: string): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };

  const { error } = await supabase.from("partners").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/brokers");
  revalidatePath("/dashboard/admin/partners");
  return { ok: true };
}
