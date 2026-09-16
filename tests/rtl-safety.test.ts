import { describe, it, expect } from "vitest";
import ar from "../messages/ar.json";

/**
 * Mathematical comparison operators are mirrored by the Unicode bidi algorithm
 * when they sit inside a right-to-left run. A rule written as "≤ 100$" renders
 * on an Arabic page as "≥ 100$" — the opposite condition — and nothing in the
 * build, the types or the tests notices, because the stored string is correct.
 *
 * It shipped once: the beginners category advertised "minimum deposit ≥ $100"
 * while filtering for the reverse. In Arabic the safe form is words.
 */
const MIRRORED = /[<>≤≥≮≯≰≱]/;

/** `<b>`, `<g>`, `<c>` and friends are rich-text tags for next-intl, not operators. */
function stripTags(s: string): string {
  return s.replace(/<\/?[A-Za-z][A-Za-z0-9]*>/g, "");
}

function collect(node: unknown, path: string, out: string[]): void {
  if (typeof node === "string") {
    if (MIRRORED.test(stripTags(node))) out.push(`${path}: ${node.slice(0, 60)}`);
    return;
  }
  if (!node || typeof node !== "object") return;
  Object.keys(node as Record<string, unknown>).forEach((k) => {
    collect((node as Record<string, unknown>)[k], path ? `${path}.${k}` : k, out);
  });
}

describe("Arabic copy avoids bidi-mirrored operators", () => {
  it("uses words rather than comparison signs", () => {
    const offenders: string[] = [];
    collect(ar, "", offenders);
    expect(offenders).toEqual([]);
  });
});
