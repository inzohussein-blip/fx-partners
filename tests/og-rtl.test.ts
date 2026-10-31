import { describe, it, expect } from "vitest";
import { rtlRuns, rtlLines, hasArabic } from "@/lib/og-rtl";

describe("rtlRuns", () => {
  it("keeps Arabic words in reading order, one per run", () => {
    expect(rtlRuns("دليل التداول · مقارنة الوسطاء")).toEqual(["دليل", "التداول", "·", "مقارنة", "الوسطاء"]);
  });
  it("keeps a Latin phrase together inside Arabic", () => {
    expect(rtlRuns("كيف تختار شركة مع Partners FX اليوم")).toEqual(["كيف", "تختار", "شركة", "مع", "Partners FX", "اليوم"]);
    expect(rtlRuns("4.5 · 12 مراجعة")).toEqual(["4.5 · 12", "مراجعة"]);
  });
  it("collapses extra spaces", () => {
    expect(rtlRuns("  لا   توجد  ")).toEqual(["لا", "توجد"]);
  });
  it("detects Arabic", () => {
    expect(hasArabic("XM Global")).toBe(false);
    expect(hasArabic("شركة XM")).toBe(true);
  });
});

describe("rtlLines", () => {
  it("reverses the words of each line so left-to-right layout reads right to left", () => {
    expect(rtlLines("دليل التداول · مقارنة الوسطاء")).toEqual(["الوسطاء مقارنة · التداول دليل"]);
  });
  it("breaks lines in reading order before reversing each", () => {
    expect(rtlLines("كيف تختار شركة تداول", 10)).toEqual(["تختار كيف", "تداول شركة"]);
  });
  it("keeps Latin runs intact", () => {
    expect(rtlLines("مع Partners FX اليوم")).toEqual(["اليوم Partners FX مع"]);
  });
});
