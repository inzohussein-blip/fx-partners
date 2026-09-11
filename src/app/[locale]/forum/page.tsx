import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { pageMeta, KEYWORDS } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { EditableText } from "@/components/admin-edit/editable-text";
import { SectionHeading } from "@/components/ui/section-heading";
import { ChannelCard } from "@/components/forum/channel-card";
import { PostCard } from "@/components/forum/post-card";
import { getChannels, getLatestPosts } from "@/lib/forum";
import { BadgeCheck, Radio, MessagesSquare, Newspaper } from "lucide-react";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return pageMeta({
    title: "منتدى فوركس عربي — تحليلات وأخبار وقنوات الوكلاء",
    description:
      "منتدى تداول عربي تفاعلي: تحليلات وأخبار من القنوات الرسمية، قنوات خاصة للوكلاء (IB)، ونقاش مباشر مع مجتمع المتداولين.",
    path: "/forum",
    keywords: KEYWORDS.forum,
    locale,
  });
}

export const revalidate = 30;

export default async function ForumHub() {
  const copy = await getContent("page.forum", {
    title: "منتدى التداول والقنوات",
    subtitle: "أخبار وتحليلات رسمية، قنوات خاصة بالوكلاء المعتمدين، ونقاشات حية بين المتداولين.",
  });

  const [channels, latest] = await Promise.all([getChannels(), getLatestPosts(9)]);
  const official = channels.filter((c) => c.kind === "official");
  const agents = channels.filter((c) => c.kind === "agent");

  return (
    <>
      <SiteHeader />
      <section className="hero-glow">
        <Container className="py-9 text-center sm:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            <MessagesSquare className="h-3.5 w-3.5" />
            مجتمع FX Partners
          </span>
          <h1 className="mt-5 text-[26px] font-extrabold leading-[1.3] text-white sm:text-4xl sm:leading-tight lg:text-5xl">
            <EditableText contentKey="page.forum" field="title" label="عنوان صفحة المنتدى">
              {copy.title}
            </EditableText>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            <EditableText contentKey="page.forum" field="subtitle" label="وصف صفحة المنتدى" multiline>
              {copy.subtitle}
            </EditableText>
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
