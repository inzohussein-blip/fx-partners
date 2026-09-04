import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { Eye, Clock, ShieldCheck } from "lucide-react";

export function About() {
  const t = useTranslations("About");
  const points = [
    { icon: Eye, title: t("point1Title"), desc: t("point1Desc") },
    { icon: Clock, title: t("point2Title"), desc: t("point2Desc") },
    { icon: ShieldCheck, title: t("point3Title"), desc: t("point3Desc") },
  ];

  return (
    <section id="about" className="py-16 sm:py-20">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            {t("badge")}
          </span>
          <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
            {t("heading")}
          </h2>
          <p className="mt-4 leading-relaxed text-slate-400">{t("body")}</p>

          <div className="mt-8 space-y-4">
            {points.map((p) => (
              <div key={p.title} className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
                  <p.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">{p.title}</div>
                  <div className="text-sm text-slate-400">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface relative overflow-hidden p-8 sm:p-10">
          <div className="hero-glow absolute inset-0 opacity-60" />
          <div className="relative grid grid-cols-2 gap-6">
            {[
              { value: t("years"), label: t("yearsLabel") },
              { value: t("projects"), label: t("projectsLabel") },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div dir="ltr" className="text-4xl font-extrabold text-gradient">
                  {s.value}
                </div>
                <div className="mt-2 text-sm text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
