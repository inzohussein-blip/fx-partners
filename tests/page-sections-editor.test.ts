import { describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/actions/page-sections", () => ({ savePageSections: vi.fn(), resetPageSections: vi.fn() }));

import { PageSectionsEditor } from "@/components/dashboard/page-sections-editor";
import { PAGES, pageDef, type SectionRow } from "@/lib/page-sections";

const pages = PAGES.map((p) => ({ key: p.key, label: p.label, path: p.path }));

describe("PageSectionsEditor", () => {
  it("lists the code's sections for an uncustomised page", () => {
    const home = pageDef("home")!;
    const html = renderToString(createElement(PageSectionsEditor, { pages, page: home, saved: [] }));
    for (const b of home.builtins) expect(html).toContain(b.label);
    expect(html).toContain("على الترتيب الأصلي");
  });

  it("shows saved custom blocks, hidden state and appends forgotten built-ins", () => {
    const compare = pageDef("compare")!;
    const saved: SectionRow[] = [
      { kind: "cards", is_visible: false, config: { title: { ar: "بطاقاتي", en: "" }, subtitle: { ar: "", en: "" }, columns: 3, items: [] } },
    ];
    const html = renderToString(createElement(PageSectionsEditor, { pages, page: compare, saved }));
    expect(html).toContain("بطاقاتي");
    expect(html).toContain("مخفي");
    expect(html).toContain("محتوى الصفحة");
    expect(html).toContain("مخصّصة");
  });
});
