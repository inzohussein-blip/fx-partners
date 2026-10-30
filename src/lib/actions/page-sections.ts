"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CUSTOM_KINDS, pageDef, type CustomKind } from "@/lib/page-sections";

type ActionResult = { ok: boolean; error?: string };

export type EditorSection =
  | { kind: "builtin"; builtin: string; is_visible: boolean }
  | { kind: CustomKind; is_visible: boolean; config: unknown };

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, admin: false as const };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return { supabase, admin: profile?.role === "admin" };
}

/**
 * Save one page's section list. Everything is re-validated here: unknown
 * built-ins are refused, custom blocks are parsed through their schema (which
 * also strips unsafe links), and required built-ins are always visible. The
 * database function checks admin rights again and replaces the list in one
 * transaction.
 */
export async function savePageSections(page: string, sections: EditorSection[]): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  const def = pageDef(page);
  if (!def) return { ok: false, error: "صفحة غير معروفة" };
  if (!Array.isArray(sections) || sections.length > 40) return { ok: false, error: "عدد الأقسام غير صالح" };

  const builtins = new Map(def.builtins.map((b) => [b.id, b]));
  const seen = new Set<string>();
  const rows: { kind: string; builtin?: string; is_visible: boolean; config?: unknown }[] = [];
  for (const s of sections) {
    if (s.kind === "builtin") {
      const b = builtins.get(s.builtin);
      if (!b || seen.has(s.builtin)) return { ok: false, error: `قسم غير معروف: ${s.builtin}` };
      seen.add(s.builtin);
      rows.push({ kind: "builtin", builtin: s.builtin, is_visible: b.required ? true : !!s.is_visible });
    } else if (s.kind in CUSTOM_KINDS) {
      const parsed = CUSTOM_KINDS[s.kind].schema.safeParse(s.config ?? {});
      if (!parsed.success) return { ok: false, error: "محتوى قسم غير صالح" };
      rows.push({ kind: s.kind, is_visible: !!s.is_visible, config: parsed.data });
    } else {
      return { ok: false, error: "نوع قسم غير معروف" };
    }
  }
  // Built-ins left out of the list keep their default place at the end.
  for (const b of def.builtins) if (!seen.has(b.id)) rows.push({ kind: "builtin", builtin: b.id, is_visible: true });

  const { error } = await supabase.rpc("save_page_sections", { p_page: page, p_sections: rows });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Back to the layout in the code. */
export async function resetPageSections(page: string): Promise<ActionResult> {
  const { supabase, admin } = await requireAdmin();
  if (!admin) return { ok: false, error: "غير مصرّح" };
  if (!pageDef(page)) return { ok: false, error: "صفحة غير معروفة" };
  const { error } = await supabase.rpc("save_page_sections", { p_page: page, p_sections: [] });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
