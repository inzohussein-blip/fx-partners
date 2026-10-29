import { describe, it, expect } from "vitest";
import { formatAlert, meccaTime, eventTimeLabel } from "@/lib/news-alerts";
import { INDICATORS, indicatorBySlug } from "@/lib/indicators";

describe("meccaTime", () => {
  it("shows UTC+3 regardless of the server's zone", () => {
    expect(meccaTime("2026-11-06T13:30:00Z")).toBe("16:30");
    expect(meccaTime("2026-07-03T12:30:00Z")).toBe("15:30");
    expect(eventTimeLabel("2026-11-06T13:30:00Z")).toBe("16:30 بتوقيت مكة");
  });
});

describe("formatAlert", () => {
  const now = new Date("2026-11-06T12:30:00Z");
  const base = { id: "1", title: "الوظائف غير الزراعية", country: "US", starts_at: "2026-11-06T13:30:00Z" };

  it("says how long until release and when, in Mecca time", () => {
    const msg = formatAlert({ ...base, indicator: null }, now, "https://partners-fx.trade");
    expect(msg).toContain("بعد 60 دقيقة");
    expect(msg).toContain("16:30 بتوقيت مكة");
    expect(msg).toContain("https://partners-fx.trade/calendar");
    expect(msg).not.toContain("/indicators/");
  });

  it("links the guide when the event names a known indicator", () => {
    const msg = formatAlert({ ...base, indicator: "nfp" }, now, "https://partners-fx.trade");
    expect(msg).toContain("https://partners-fx.trade/indicators/nfp");
  });

  it("ignores an unknown indicator slug", () => {
    const msg = formatAlert({ ...base, indicator: "nope" }, now, "https://x.test");
    expect(msg).not.toContain("/indicators/");
  });

  it("escapes admin-entered text for Telegram HTML", () => {
    const msg = formatAlert({ ...base, title: "CPI <b>&</b>", indicator: null }, now, "https://x.test");
    expect(msg).toContain("CPI &lt;b&gt;&amp;&lt;/b&gt;");
  });
});

describe("indicator guides", () => {
  it("have unique slugs, valid related links and official https sources", () => {
    const slugs = INDICATORS.map((i) => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const i of INDICATORS) {
      expect(i.official.url).toMatch(/^https:\/\//);
      for (const r of i.related) expect(indicatorBySlug(r), `${i.slug} → ${r}`).toBeDefined();
      expect(i.watch.ar.length).toBe(i.watch.en.length);
    }
  });
});
