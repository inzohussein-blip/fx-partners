import { Fragment, type ReactNode } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import {
  pageDef,
  parseRow,
  resolveSections,
  type SectionRow,
  type CardsConfig,
  type CtaConfig,
  type BannerConfig,
  type TextConfig,
} from "@/lib/page-sections";
import { CardsSection, CtaSection, BannerSection, TextSection } from "./custom-sections";

async function savedRows(page: string): Promise<SectionRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const { data, error } = await createPublicClient()
      .from("page_sections")
      .select("kind,builtin,is_visible,config,position")
      .eq("page", page)
      .order("position", { ascending: true });
    if (error || !data) return [];
    return data.map(parseRow).filter((r): r is SectionRow => r !== null);
  } catch {
    return [];
  }
}

/**
 * Renders a page's sections in the order an admin set (or the code's order
 * when the page has not been customised). `builtins` maps each built-in id of
 * the page (lib/page-sections PAGES) to its JSX; a hidden built-in is simply
 * never rendered, so its data is not fetched either.
 */
export async function PageSections({
  page,
  locale,
  builtins,
}: {
  page: string;
  locale: string;
  builtins: Record<string, ReactNode>;
}) {
  const def = pageDef(page);
  if (!def) return <>{Object.values(builtins)}</>;
  const sections = resolveSections(def, await savedRows(page));

  return (
    <>
      {sections.map((s) => {
        if (s.kind === "builtin") return <Fragment key={`b-${s.id}`}>{builtins[s.id] ?? null}</Fragment>;
        const key = `c-${s.index}`;
        switch (s.kind) {
          case "cards":
            return <CardsSection key={key} config={s.config as CardsConfig} locale={locale} />;
          case "cta":
            return <CtaSection key={key} config={s.config as CtaConfig} locale={locale} />;
          case "banner":
            return <BannerSection key={key} config={s.config as BannerConfig} locale={locale} />;
          case "text":
            return <TextSection key={key} config={s.config as TextConfig} locale={locale} />;
        }
      })}
    </>
  );
}
