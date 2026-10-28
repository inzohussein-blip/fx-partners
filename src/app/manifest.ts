import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Partners FX — منصة الشراكة المالية",
    short_name: "Partners FX",
    description:
      "منصة شراكة مالية تربط الوكلاء والمسوّقين بأفضل شركات التداول العالمية.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "ar",
    dir: "rtl",
    background_color: "#0A0F14",
    theme_color: "#0A0F14",
    categories: ["finance", "business"],
    icons: [
      { src: "/icon", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
