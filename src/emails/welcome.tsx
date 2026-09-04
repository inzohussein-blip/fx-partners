import { Text } from "@react-email/components";
import * as React from "react";
import { BrandEmail, CtaButton } from "./brand-email";

export type WelcomeEmailProps = {
  name?: string;
  dashboardUrl: string;
};

export function WelcomeEmail({ name, dashboardUrl }: WelcomeEmailProps) {
  return (
    <BrandEmail
      preview="أهلاً بك في شبكة شركاء FX Partners"
      heading={`أهلاً${name ? ` ${name}` : ""} في FX Partners 👋`}
    >
      <Text className="text-[14px] leading-[22px]" style={{ color: "#cbd5e1" }}>
        سعداء بانضمامك إلى شبكة شركائنا. بعد اعتماد حسابك ستحصل على كود وكيل وروابط
        إحالة ديناميكية تبدأ بمشاركتها فوراً، وتتابع أرباحك وإحالاتك لحظياً من لوحة
        التحكم.
      </Text>
      <Text className="text-[14px] leading-[22px]" style={{ color: "#cbd5e1" }}>
        ابدأ الآن من خلال الدخول إلى لوحة الشريك:
      </Text>
      <CtaButton href={dashboardUrl} label="الدخول إلى لوحة الشريك" />
    </BrandEmail>
  );
}

export default WelcomeEmail;
