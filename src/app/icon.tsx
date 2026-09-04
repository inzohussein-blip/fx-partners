import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// App / PWA icon — brand gradient tile with the FX mark.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 45%, #06b6d4 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 210, fontWeight: 800, color: "#a5f3fc" }}>F</span>
          <span style={{ fontSize: 210, fontWeight: 800 }}>X</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: -10,
            fontSize: 58,
            letterSpacing: 6,
            color: "#e2e8f0",
            fontWeight: 600,
          }}
        >
          partners
        </div>
      </div>
    ),
    { ...size }
  );
}
