import { ImageResponse } from "next/og";
import { loadArabicFont, fallbackCard, OG_HEADERS } from "@/lib/og-font";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "شركة تداول";
  const rating = searchParams.get("rating") || "";
  const reviews = searchParams.get("reviews") || "";
  const bonus = searchParams.get("bonus") || "";
  const partnered = searchParams.get("partnered") === "1";

  // A broker with no reviews yet has no score. Painting five grey stars and
  // "0.0" would publish a *bad* rating for it across every share preview, so
  // the unrated case says so in words instead.
  const rated = rating !== "" && Number(reviews) > 0;
  const stars = rated ? Math.round(Number(rating)) : 0;

  const fonts = await loadArabicFont(
    `${name} ${bonus} شريك معتمد لا توجد مراجعات بعد مراجعة قارن راجِع افتح حساباً`,
    700
  );
  if (fonts.length === 0) return fallbackCard(1200, 630, name);

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
          <span style={{ fontSize: 40, fontWeight: 800 }}>Partners</span>
          <span style={{ color: "#54D8F0", fontSize: 40, fontWeight: 800 }}>FX</span>
        </div>

        {/* Broker name + status */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ fontSize: 72, fontWeight: 800 }}>{name}</span>
            {partnered && (
              <span
                style={{
                  display: "flex",
                  fontSize: 26,
                  color: "#6ee7b7",
                  border: "2px solid rgba(110,231,183,0.4)",
                  borderRadius: 999,
                  padding: "8px 20px",
                }}
              >
                شريك معتمد
              </span>
            )}
          </div>

          {/* Stars */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {rated ? (
              // Drawn as SVG: "★" is not in the subset font, and a missing
              // glyph makes Satori throw.
              <span style={{ display: "flex", gap: 6 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <svg key={i} width="44" height="44" viewBox="0 0 24 24">
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                      fill={i < stars ? "#fbbf24" : "#334155"}
                    />
                  </svg>
                ))}
              </span>
            ) : (
              <span style={{ display: "flex" }} />
            )}
            <span style={{ fontSize: 34, color: "#cbd5e1" }}>
              {rated ? `${rating} · ${reviews} مراجعة` : "لا توجد مراجعات بعد"}
            </span>
          </div>
        </div>

        {/* Footer: bonus + CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {bonus ? (
            <span
              style={{
                display: "flex",
                fontSize: 34,
                color: "#fcd34d",
                backgroundColor: "rgba(245,158,11,0.12)",
                borderRadius: 16,
                padding: "14px 28px",
              }}
            >
              {bonus}
            </span>
          ) : (
            <span style={{ display: "flex" }} />
          )}
          <span style={{ display: "flex", fontSize: 30, color: "#67e8f9" }}>
            قارن · راجِع · افتح حساباً
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts, headers: OG_HEADERS }
  );
}
