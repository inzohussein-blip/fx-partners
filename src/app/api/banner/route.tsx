import { ImageResponse } from "next/og";

export const runtime = "edge";

const SIZES: Record<string, [number, number]> = {
  wide: [1200, 630],
  leaderboard: [728, 90],
  rectangle: [300, 250],
  skyscraper: [160, 600],
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("size") || "wide";
  const [w, h] = SIZES[key] ?? SIZES.wide;
  const ref = (searchParams.get("ref") || "fx-partners.vercel.app").replace(
    /^https?:\/\//,
    ""
  );
  const name = searchParams.get("name") || "";
  const horizontal = h < 160;
  const unit = Math.min(w, h);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: horizontal ? "row" : "column",
          alignItems: "center",
          justifyContent: "center",
          gap: horizontal ? unit * 0.18 : unit * 0.12,
          padding: unit * 0.12,
          backgroundColor: "#0A0F14",
          backgroundImage:
            "radial-gradient(120% 120% at 100% 0%, rgba(37,99,235,0.40), rgba(6,15,30,0) 60%), radial-gradient(120% 120% at 0% 100%, rgba(34,211,238,0.28), rgba(6,15,30,0) 60%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: unit * 0.03 }}>
          <span style={{ color: "#00D1E6", fontSize: unit * 0.17, fontWeight: 800 }}>
            FX
          </span>
          <span style={{ fontSize: unit * 0.17, fontWeight: 800 }}>Partners</span>
        </div>

        {!horizontal && (
          <div
            style={{
              display: "flex",
              fontSize: unit * 0.085,
              color: "#cbd5e1",
              textAlign: "center",
              maxWidth: w * 0.85,
            }}
          >
            Global Trading Partnerships
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(34,211,238,0.12)",
            border: "1px solid rgba(34,211,238,0.35)",
            borderRadius: 999,
            padding: `${unit * 0.035}px ${unit * 0.09}px`,
            fontSize: unit * 0.08,
            color: "#67e8f9",
          }}
        >
          {ref}
        </div>

        {name && !horizontal && (
          <div style={{ display: "flex", fontSize: unit * 0.06, color: "#94a3b8" }}>
            Official Partner · {name}
          </div>
        )}
      </div>
    ),
    { width: w, height: h }
  );
}
