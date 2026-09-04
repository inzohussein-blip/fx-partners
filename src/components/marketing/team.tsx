import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Users } from "lucide-react";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

export function Team() {
  const t = useTranslations("Team");
  const members = [
    { name: t("m1Name"), role: t("m1Role") },
    { name: t("m2Name"), role: t("m2Role") },
    { name: t("m3Name"), role: t("m3Role") },
    { name: t("m4Name"), role: t("m4Role") },
  ];

  return (
    <section id="team" className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow={t("badge")}
          icon={Users}
          title={t("heading")}
          subtitle={t("subheading")}
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((m) => (
            <div key={m.name} className="card-surface p-6 text-center">
              <div
                dir="ltr"
                className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-gradient text-xl font-bold text-white"
              >
                {initials(m.name)}
              </div>
              <div className="mt-4 font-semibold text-white">{m.name}</div>
              <div className="mt-1 text-sm text-brand-300">{m.role}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
