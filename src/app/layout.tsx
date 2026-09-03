import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { getSiteUrl } from "@/lib/utils";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FX Partners — شراكة مالية عالمية",
    template: "%s | FX Partners",
  },
  description:
    "FX Partners — منصة الشراكة المالية للوكلاء (IBs) والمسوّقين وشركات التداول العالمية. أعلى نسب العمولات، شفافية كاملة، ودفعات في الوقت.",
  metadataBase: new URL(getSiteUrl()),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body>{children}</body>
    </html>
  );
}
