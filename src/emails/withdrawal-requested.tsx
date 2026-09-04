import { Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import { BrandEmail, CtaButton } from "./brand-email";

export type WithdrawalRequestedEmailProps = {
  name?: string;
  amount: string; // pre-formatted, e.g. "$1,200.00"
  method: string;
  dashboardUrl: string;
};

const methodLabel: Record<string, string> = {
  bank_transfer: "تحويل بنكي",
  crypto: "عملة رقمية (USDT)",
  ewallet: "محفظة إلكترونية",
};

export function WithdrawalRequestedEmail({
  name,
  amount,
  method,
  dashboardUrl,
}: WithdrawalRequestedEmailProps) {
  return (
    <BrandEmail
      preview={`تم استلام طلب سحب بقيمة ${amount}`}
      heading="تم استلام طلب السحب ✅"
    >
      <Text className="text-[14px] leading-[22px]" style={{ color: "#cbd5e1" }}>
        {name ? `مرحباً ${name}، ` : ""}استلمنا طلب سحب أرباحك وهو الآن قيد المراجعة.
        سنُعلمك فور معالجته.
      </Text>

      <Section
        className="my-4 rounded-[10px] p-4"
        style={{ backgroundColor: "#060f1e", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Row>
          <Column style={{ color: "#94a3b8", fontSize: "13px" }}>المبلغ</Column>
          <Column style={{ color: "#ffffff", fontWeight: 700, textAlign: "left" }}>
            {amount}
          </Column>
        </Row>
        <Row>
          <Column style={{ color: "#94a3b8", fontSize: "13px", paddingTop: "8px" }}>
            الطريقة
          </Column>
          <Column style={{ color: "#e2e8f0", textAlign: "left", paddingTop: "8px" }}>
            {methodLabel[method] ?? method}
          </Column>
        </Row>
        <Row>
          <Column style={{ color: "#94a3b8", fontSize: "13px", paddingTop: "8px" }}>
            الحالة
          </Column>
          <Column style={{ color: "#f5c451", textAlign: "left", paddingTop: "8px" }}>
            قيد المراجعة
          </Column>
        </Row>
      </Section>

      <CtaButton href={`${dashboardUrl}/wallet`} label="عرض المحفظة" />
    </BrandEmail>
  );
}

export default WithdrawalRequestedEmail;
