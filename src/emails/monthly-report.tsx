import { Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import { BrandEmail, CtaButton } from "./brand-email";

export type MonthlyReportEmailProps = {
  name?: string;
  month: string; // e.g. "أغسطس 2026"
  earnings: string; // pre-formatted
  referrals: number;
  volume: string; // pre-formatted
  dashboardUrl: string;
};

export function MonthlyReportEmail({
  name,
  month,
  earnings,
  referrals,
  volume,
  dashboardUrl,
}: MonthlyReportEmailProps) {
  const stats = [
    { label: "الأرباح", value: earnings, color: "#22d3ee" },
    { label: "الإحالات", value: String(referrals), color: "#ffffff" },
    { label: "حجم التداول", value: volume, color: "#ffffff" },
  ];

  return (
    <BrandEmail
      preview={`تقرير أرباحك لشهر ${month}`}
      heading={`تقرير أرباحك — ${month}`}
    >
      <Text className="text-[14px] leading-[22px]" style={{ color: "#cbd5e1" }}>
        {name ? `مرحباً ${name}، ` : ""}إليك ملخّص أدائك خلال {month}:
      </Text>

      <Section className="my-4">
        <Row>
          {stats.map((s) => (
            <Column
              key={s.label}
              className="rounded-[10px] p-4 text-center"
              style={{
                backgroundColor: "#060f1e",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Text
                className="m-0 text-[20px] font-bold"
                style={{ color: s.color }}
              >
                {s.value}
              </Text>
              <Text className="m-0 text-[12px]" style={{ color: "#94a3b8" }}>
                {s.label}
              </Text>
            </Column>
          ))}
        </Row>
      </Section>

      <CtaButton href={dashboardUrl} label="عرض التقرير الكامل" />
    </BrandEmail>
  );
}

export default MonthlyReportEmail;
