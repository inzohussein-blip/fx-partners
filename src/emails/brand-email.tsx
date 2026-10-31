import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Tailwind,
  Preview,
  Img,
} from "@react-email/components";
import * as React from "react";
import { getSiteUrl } from "@/lib/utils";

/** Shared Partners FX branded email shell (navy + cyan, RTL). */
export function BrandEmail({
  preview,
  heading,
  children,
}: {
  preview: string;
  heading?: string;
  children: React.ReactNode;
}) {
  return (
    <Html dir="rtl" lang="ar">
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body
          style={{ backgroundColor: "#060f1e" }}
          className="font-sans"
        >
          <Container
            className="mx-auto my-8 max-w-[560px] rounded-[16px] p-8"
            style={{ backgroundColor: "#0a1728", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Section className="text-center">
              {/* PNG, not SVG: most mail clients (Gmail, Outlook) block SVG. */}
              <Img
                src={`${getSiteUrl()}/icons/icon-192.png`}
                width="44"
                height="44"
                alt=""
                className="mx-auto mb-2 rounded-[10px]"
              />
              <Text className="m-0 text-[22px] font-bold text-fg">
                Partners <span style={{ color: "#22d3ee" }}>FX</span>
              </Text>
            </Section>

            <Hr style={{ borderColor: "rgba(255,255,255,0.08)" }} className="my-6" />

            {heading ? (
              <Heading className="mb-4 text-[20px] font-bold text-fg">
                {heading}
              </Heading>
            ) : null}

            {children}

            <Hr style={{ borderColor: "rgba(255,255,255,0.08)" }} className="my-6" />
            <Text className="m-0 text-center text-[12px]" style={{ color: "#64748b" }}>
              © Partners FX — منصة الشراكة المالية
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

/** Primary CTA button styled with the brand gradient. */
export function CtaButton({ href, label }: { href: string; label: string }) {
  return (
    <table style={{ margin: "8px 0" }}>
      <tbody>
        <tr>
          <td
            style={{
              backgroundColor: "#004884",
              backgroundImage: "linear-gradient(90deg,#2563eb,#22d3ee)",
              borderRadius: "10px",
            }}
          >
            <a
              href={href}
              style={{
                display: "inline-block",
                padding: "12px 24px",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              {label}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
