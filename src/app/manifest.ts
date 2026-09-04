import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FX Partners — منصة الشراكة المالية",
    short_name: "FX Partners",
    description:
      "منصة شراكة مالية تربط الوكلاء والمسوّقين بأفضل شركات التداول العالمية.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "ar",
    dir: "rtl",
    background_color: "#060f1e",
    theme_color: "#060f1e",
    categories: ["finance", "business"],
    icons: [
      { src: "/icon", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
