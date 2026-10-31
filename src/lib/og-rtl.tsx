/**
 * Right-to-left text for next/og (Satori). Satori shapes each Arabic word
 * correctly but has no bidi support: it lays a line's words out left to
 * right, so "دليل التداول" comes out as "التداول دليل". Boxing every word
 * separately fixes the order but not the spacing (it measures each Arabic
 * word too wide), so instead each line is handed over as one string with its
 * words already reversed, and long text is broken into lines here, before
 * Satori would wrap it in the wrong order.
 *
 * Runs of non-Arabic words ("Partners FX", "4.5 · 12") stay together, in
 * their own left-to-right order.
 */

const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

export function hasArabic(text: string): boolean {
  return ARABIC.test(text);
}

/** Words in reading order; consecutive non-Arabic words merged into one run. */
export function rtlRuns(text: string): string[] {
  const runs: string[] = [];
  let latin: string[] = [];
  for (const word of text.trim().split(/\s+/).filter(Boolean)) {
    if (ARABIC.test(word)) {
      if (latin.length) runs.push(latin.join(" "));
      latin = [];
      runs.push(word);
    } else {
      latin.push(word);
    }
  }
  if (latin.length) runs.push(latin.join(" "));
  return runs;
}

/** Greedy line breaking by character count: Satori cannot measure for us. */
export function rtlLines(text: string, maxChars = Infinity): string[] {
  const lines: string[][] = [];
  let line: string[] = [];
  let len = 0;
  for (const run of rtlRuns(text)) {
    if (line.length && len + 1 + run.length > maxChars) {
      lines.push(line);
      line = [];
      len = 0;
    }
    line.push(run);
    len += (line.length > 1 ? 1 : 0) + run.length;
  }
  if (line.length) lines.push(line);
  // Each line's runs reversed, so Satori's left-to-right layout reads right to left.
  return lines.map((l) => [...l].reverse().join(" "));
}

type Style = Record<string, string | number>;

/**
 * `text` laid out right to left when it contains Arabic, plainly otherwise.
 * `maxChars` is the line length to break at; leave it out for one line.
 */
export function RtlText({ text, style, maxChars }: { text: string; style: Style; maxChars?: number }) {
  if (!hasArabic(text)) return <span style={{ display: "flex", ...style }}>{text}</span>;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", ...style }}>
      {rtlLines(text, maxChars).map((line, i) => (
        <span key={i} style={{ display: "flex" }}>
          {line}
        </span>
      ))}
    </div>
  );
}
