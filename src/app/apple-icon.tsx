import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 45%, #06b6d4 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
          <span style={{ fontSize: 90, fontWeight: 800, color: "#a5f3fc" }}>F</span>
          <span style={{ fontSize: 90, fontWeight: 800 }}>X</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
