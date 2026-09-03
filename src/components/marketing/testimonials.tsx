import { Container } from "@/components/ui/container";
import { Quote } from "lucide-react";

const items = [
  {
    quote:
      "منذ انضمامي كوكيل، أصبح تتبّع عمولاتي وإحالاتي شفافاً بالكامل، والسحوبات تصل في وقتها دائماً.",
    name: "أحمد الشمري",
    role: "وكيل معتمد (IB)",
  },
  {
    quote:
      "لوحة التحكم توفّر لي كل ما أحتاجه: روابط إحالة، إحصائيات حيّة، وتقارير دقيقة لكل حملة.",
    name: "سارة عبدالله",
    role: "شريكة تسويق",
  },
  {
    quote:
      "التعاون مع FX Partners على مستوى الشركات كان سلساً — تكامل تقني سريع وشروط مرنة.",
    name: "Global Markets Ltd",
    role: "شركة تداول (B2B)",
  },
];

export function Testimonials() {
  return (
    <section className="py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            يثق بنا الشركاء حول العالم
          </h2>
          <p className="mt-4 text-slate-400">
            تجارب حقيقية من وكلاء ومسوّقين وشركات تداول ضمن شبكتنا.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {items.map((t) => (
            <figure key={t.name} className="card-surface flex flex-col p-6">
              <Quote className="h-6 w-6 text-brand-400" />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-300">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 border-t border-white/5 pt-4">
                <div className="font-semibold text-white">{t.name}</div>
                <div className="text-xs text-brand-300">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
