import { ImageResponse } from "next/og";

export const runtime = "edge";

/**
 * Social share card for a blog article. Blog posts had no image, so every
 * share fell back to the site default — a wall of identical previews. This
 * paints the article title on the brand background so each post looks like
 * itself in a timeline.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawTitle = searchParams.get("title") || "مدوّنة FX Partners";
  // Keep the card readable: very long titles are trimmed rather than shrunk to
  // nothing.
  const title = rawTitle.length > 120 ? `${rawTitle.slice(0, 117)}…` : rawTitle;

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
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#54D8F0", fontSize: 40, fontWeight: 800 }}>FX</span>
          <span style={{ fontSize: 40, fontWeight: 800 }}>Partners</span>
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
        <div
          style={{
            display: "flex",
            fontSize: title.length > 70 ? 56 : 68,
            fontWeight: 800,
            lineHeight: 1.25,
            direction: "rtl",
          }}
        >
          {title}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", fontSize: 30, color: "#67e8f9" }}>
          دليل التداول · مقارنة الوسطاء
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
