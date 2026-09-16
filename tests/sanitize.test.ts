import { describe, it, expect } from "vitest";
import { sanitizeRichHtml } from "@/lib/sanitize";

describe("sanitizeRichHtml", () => {
  it("keeps ordinary formatting untouched", () => {
    const html =
      "<h2>عنوان</h2><p>نص <strong>غامق</strong> و<em>مائل</em></p><ul><li>عنصر</li></ul>";
    expect(sanitizeRichHtml(html)).toBe(html);
  });

  it("strips <script> tags", () => {
    const out = sanitizeRichHtml('<p>مرحبا</p><script>alert(1)</script>');
    expect(out).not.toContain("<script");
    expect(out).not.toContain("alert(1)");
    expect(out).toContain("<p>مرحبا</p>");
  });

  it("drops event-handler attributes", () => {
    const out = sanitizeRichHtml('<img src="https://x/y.png" onerror="alert(1)" alt="a">');
    expect(out).not.toContain("onerror");
    expect(out).toContain('src="https://x/y.png"');
  });

  it("removes javascript: links but keeps the text", () => {
    const out = sanitizeRichHtml('<a href="javascript:alert(1)">اضغط</a>');
    expect(out).not.toContain("javascript:");
    expect(out).toContain("اضغط");
  });

  it("keeps safe links and forces noopener on new-tab links", () => {
    const out = sanitizeRichHtml('<a href="https://ok.com" target="_blank">رابط</a>');
    expect(out).toContain('href="https://ok.com"');
    expect(out).toContain('rel="noopener noreferrer"');
  });

  it("blocks data: URLs on images", () => {
    const out = sanitizeRichHtml('<img src="data:text/html,<script>alert(1)</script>" alt="x">');
    expect(out).not.toContain("data:");
  });

  it("returns empty string for nullish input", () => {
    expect(sanitizeRichHtml(null)).toBe("");
    expect(sanitizeRichHtml(undefined)).toBe("");
    expect(sanitizeRichHtml("")).toBe("");
  });
});
