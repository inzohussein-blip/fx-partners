import { ImageResponse } from "next/og";
import { loadArabicFont, fallbackCard, OG_HEADERS } from "@/lib/og-font";
import { OgMark } from "@/lib/og-mark";
import { RtlText } from "@/lib/og-rtl";


/**
 * Social share card for a blog article. Blog posts had no image, so every
 * share fell back to the site default — a wall of identical previews. This
 * paints the article title on the brand background so each post looks like
 * itself in a timeline.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawTitle = searchParams.get("title") || "مدوّنة Partners FX";
  // Keep the card readable: very long titles are trimmed rather than shrunk to
  // nothing.
  const title = rawTitle.length > 120 ? `${rawTitle.slice(0, 117)}…` : rawTitle;

  const fonts = await loadArabicFont(
    `${title} Partners FX مدوّنة دليل التداول · مقارنة الوسطاء`,
    700
  );
  if (fonts.length === 0) return fallbackCard(1200, 630);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#0A0F14",
          backgroundImage:
            "radial-gradient(120% 120% at 100% 0%, rgba(37,99,235,0.40), rgba(6,15,30,0) 60%), radial-gradient(120% 120% at 0% 100%, rgba(34,211,238,0.28), rgba(6,15,30,0) 60%)",
          color: "#ffffff",
          fontFamily: "Cairo, sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <OgMark size={52} />
          <span style={{ fontSize: 40, fontWeight: 800 }}>Partners</span>
          <span style={{ color: "#54D8F0", fontSize: 40, fontWeight: 800 }}>FX</span>
          <span
            style={{
              display: "flex",
              marginInlineStart: 16,
              fontSize: 26,
              color: "#94a3b8",
              border: "2px solid rgba(148,163,184,0.35)",
              borderRadius: 999,
              padding: "6px 20px",
            }}
          >
            مدوّنة
          </span>
        </div>

        {/* Title */}
        <RtlText
          text={title}
          style={{ fontSize: title.length > 70 ? 56 : 68, fontWeight: 800, lineHeight: 1.25 }}
          // ~1056px of width at roughly half an em per Arabic character.
          maxChars={title.length > 70 ? 36 : 30}
        />

        {/* Footer */}
        <RtlText text="دليل التداول · مقارنة الوسطاء" style={{ fontSize: 30, color: "#67e8f9" }} />
      </div>
    ),
    { width: 1200, height: 630, fonts, headers: OG_HEADERS }
  );
}
