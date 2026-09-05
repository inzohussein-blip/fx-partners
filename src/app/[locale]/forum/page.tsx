import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ChannelCard } from "@/components/forum/channel-card";
import { PostCard } from "@/components/forum/post-card";
import { getChannels, getLatestPosts } from "@/lib/forum";
import { BadgeCheck, Radio, MessagesSquare, Newspaper } from "lucide-react";

export const metadata: Metadata = {
  title: "المنتدى والقنوات",
  description:
    "منتدى تداول تفاعلي: أخبار وتحليلات رسمية من FX Partners وقنوات خاصة للوكلاء، ونقاشات مباشرة مع المجتمع.",
};

export const revalidate = 30;

export default async function ForumHub() {
  const [channels, latest] = await Promise.all([getChannels(), getLatestPosts(9)]);
  const official = channels.filter((c) => c.kind === "official");
  const agents = channels.filter((c) => c.kind === "agent");

  return (
    <>
      <SiteHeader />
      <section className="hero-glow">
        <Container className="py-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            <MessagesSquare className="h-3.5 w-3.5" />
            مجتمع FX Partners
          </span>
          <h1 className="mt-5 text-4xl font-extrabold text-white sm:text-5xl">
            منتدى التداول والقنوات
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            أخبار وتحليلات رسمية، قنوات خاصة بالوكلاء المعتمدين، ونقاشات حية بين المتداولين.
          </p>
        </Container>
      </section>

      <section className="pb-16">
        <Container className="space-y-14">
          {/* Latest feed */}
          {latest.length > 0 && (
            <div>
              <SectionHeading
                align="start"
                eyebrow="الأحدث"
                icon={Newspaper}
                title="آخر المنشورات"
                subtitle="أحدث الأخبار والتحليلات عبر جميع القنوات."
              />
              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {latest.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}

          {/* Official channels */}
          <div>
            <SectionHeading
              align="start"
              eyebrow="رسمي"
              icon={BadgeCheck}
              title="القنوات الرسمية"
              subtitle="الأخبار والتحليلات الرسمية من فريق FX Partners."
            />
            {official.length > 0 ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {official.map((c) => (
                  <ChannelCard key={c.id} channel={c} />
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-500">لا توجد قنوات رسمية بعد.</p>
            )}
          </div>

          {/* Agent channels */}
          <div>
            <SectionHeading
              align="start"
              eyebrow="الوكلاء"
              icon={Radio}
              title="قنوات الوكلاء"
              subtitle="قنوات خاصة ينشر فيها الوكلاء المعتمدون تحليلاتهم وتوصياتهم."
            />
            {agents.length > 0 ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {agents.map((c) => (
                  <ChannelCard key={c.id} channel={c} />
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-500">لا توجد قنوات وكلاء بعد.</p>
            )}
          </div>
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
