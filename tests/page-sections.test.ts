import { describe, it, expect } from "vitest";
import {
  PAGES,
  pageDef,
  parseRow,
  resolveSections,
  cleanHref,
  bannerExpired,
  cardsConfig,
  bannerConfig,
  type SectionRow,
} from "@/lib/page-sections";

const home = pageDef("home")!;

describe("cleanHref", () => {
  it.each(["/compare", "/indicators/cpi?x=1#a", "https://example.com", "https://example.com/a/b"])("keeps %s", (h) =>
    expect(cleanHref(h)).toBe(h)
  );
  it.each(["javascript:alert(1)", "//evil.com", "/\\evil.com", "http://plain.com", "data:text/html,x", " ", "mailto:a@b.c", 5])(
    "drops %s",
    (h) => expect(cleanHref(h)).toBe("")
  );
});

describe("resolveSections", () => {
  it("renders the code's order when nothing is saved", () => {
    expect(resolveSections(home, []).map((s) => (s.kind === "builtin" ? s.id : s.kind))).toEqual(home.builtins.map((b) => b.id));
  });

  it("follows the saved order, hides hidden built-ins and appends ones the list forgot", () => {
    const rows: SectionRow[] = [
      { kind: "builtin", builtin: "faq", is_visible: true },
      { kind: "builtin", builtin: "network", is_visible: false },
      { kind: "builtin", builtin: "hero", is_visible: true },
    ];
    const ids = resolveSections(home, rows).map((s) => (s.kind === "builtin" ? s.id : s.kind));
    expect(ids.slice(0, 2)).toEqual(["faq", "hero"]);
    expect(ids).not.toContain("network");
    expect(ids).toContain("cta");
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never hides a required built-in, skips unknown and duplicate ids, and drops hidden custom blocks", () => {
    const rows: SectionRow[] = [
      { kind: "builtin", builtin: "hero", is_visible: false },
      { kind: "builtin", builtin: "nope", is_visible: true },
      { kind: "builtin", builtin: "hero", is_visible: true },
      { kind: "text", is_visible: false, config: {} },
    ];
    const out = resolveSections(home, rows);
    expect(out.filter((s) => s.kind === "builtin" && s.id === "hero")).toHaveLength(1);
    expect(out.some((s) => s.kind === "builtin" && s.id === "nope")).toBe(false);
    expect(out.some((s) => s.kind === "text")).toBe(false);
  });
});

describe("parseRow and schemas", () => {
  it("rejects unknown kinds and malformed rows", () => {
    expect(parseRow({ kind: "script", config: {} })).toBeNull();
    expect(parseRow({ kind: "builtin" })).toBeNull();
    expect(parseRow(null)).toBeNull();
  });

  it("repairs bad values in a card instead of failing the page", () => {
    const c = cardsConfig.parse({ columns: 7, items: [{ icon: "bogus", tone: "pink", href: "javascript:x", title: { ar: "أ" } }] });
    expect(c.columns).toBe(3);
    expect(c.items[0]).toMatchObject({ icon: "sparkles", tone: "brand", href: "", title: { ar: "أ", en: "" } });
  });

  it("caps the number of cards", () => {
    expect(cardsConfig.safeParse({ items: Array.from({ length: 13 }, () => ({})) }).success).toBe(false);
  });

  it("expires a banner after its date", () => {
    const b = bannerConfig.parse({ expires: "2026-01-01" });
    expect(bannerExpired(b, new Date("2026-01-01T23:00:00Z"))).toBe(false);
    expect(bannerExpired(b, new Date("2026-01-02T00:00:00Z"))).toBe(true);
    expect(bannerExpired(bannerConfig.parse({}), new Date())).toBe(false);
  });
});

describe("page registry", () => {
  it("has unique pages and built-in ids, and every page has a required section", () => {
    expect(new Set(PAGES.map((p) => p.key)).size).toBe(PAGES.length);
    for (const p of PAGES) {
      expect(p.key).toMatch(/^[a-z0-9-]{1,40}$/);
      expect(new Set(p.builtins.map((b) => b.id)).size).toBe(p.builtins.length);
      expect(p.builtins.some((b) => b.required), p.key).toBe(true);
    }
  });
});

describe("pages pass every built-in they declare", () => {
  // Reads the page source: a built-in listed in PAGES but not handed to
  // <PageSections> would silently render nothing.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require("node:fs") as typeof import("node:fs");
  for (const p of PAGES) {
    it(p.key, () => {
      const file = `src/app/[locale]${p.path === "/" ? "" : p.path}/page.tsx`;
      const src = fs.readFileSync(file, "utf8");
      expect(src).toContain(`page="${p.key}"`);
      for (const b of p.builtins) {
        const key = /^[a-z]+$/.test(b.id) ? `${b.id}: (` : `"${b.id}": (`;
        const alt = /^[a-z]+$/.test(b.id) ? `${b.id}: <` : `"${b.id}": <`;
        expect(src.includes(key) || src.includes(alt), `${p.key} → ${b.id}`).toBe(true);
      }
    });
  }
});
