import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "شركة تداول";
  const rating = searchParams.get("rating") || "0.0";
  const reviews = searchParams.get("reviews") || "0";
  const bonus = searchParams.get("bonus") || "";
  const partnered = searchParams.get("partnered") === "1";

  const stars = Math.round(Number(rating));

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
          backgroundColor: "#060f1e",
          backgroundImage:
            "radial-gradient(120% 120% at 100% 0%, rgba(37,99,235,0.40), rgba(6,15,30,0) 60%), radial-gradient(120% 120% at 0% 100%, rgba(34,211,238,0.28), rgba(6,15,30,0) 60%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#22d3ee", fontSize: 40, fontWeight: 800 }}>FX</span>
          <span style={{ fontSize: 40, fontWeight: 800 }}>Partners</span>
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
            <span style={{ display: "flex", fontSize: 46, color: "#fbbf24" }}>
              {"★".repeat(stars)}
              <span style={{ color: "#334155" }}>{"★".repeat(5 - stars)}</span>
            </span>
            <span style={{ fontSize: 34, color: "#cbd5e1" }}>
              {rating} · {reviews} مراجعة
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
              🎁 {bonus}
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
    { width: 1200, height: 630 }
  );
}
