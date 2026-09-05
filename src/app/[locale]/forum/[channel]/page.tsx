import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PostCard } from "@/components/forum/post-card";
import { Avatar } from "@/components/forum/avatar";
import { getChannel, getChannelPosts } from "@/lib/forum";
import { BadgeCheck, Radio, MessagesSquare } from "lucide-react";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: { channel: string };
}): Promise<Metadata> {
  const channel = await getChannel(params.channel);
  if (!channel) return { title: "قناة غير موجودة" };
  return {
    title: `${channel.name} — منتدى FX Partners`,
    description: channel.description ?? undefined,
  };
}

export default async function ChannelPage({
  params,
}: {
  params: { channel: string };
}) {
  const channel = await getChannel(params.channel);
  if (!channel || channel.status !== "active") notFound();

  const posts = await getChannelPosts(channel.id);
  const official = channel.kind === "official";

  return (
    <>
      <SiteHeader />
      <section className="hero-glow">
        <Container className="py-12">
          <Breadcrumbs
            items={[{ label: "المنتدى", href: "/forum" }, { label: channel.name }]}
          />
          <div className="mt-6 flex items-start gap-4">
            <Avatar name={channel.owner_name || channel.name} src={channel.cover_image} size={64} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                  {channel.name}
                </h1>
                {official ? (
                  <BadgeCheck className="h-5 w-5 text-brand-300" aria-label="قناة رسمية" />
                ) : (
                  <Radio className="h-5 w-5 text-gold-400" aria-label="قناة وكيل" />
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {official ? "قناة رسمية · FX Partners" : channel.owner_name || "وكيل معتمد"}
              </p>
              {channel.description && (
                <p className="mt-3 max-w-2xl text-slate-300">{channel.description}</p>
              )}
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          {posts.length === 0 ? (
            <div className="card-surface flex flex-col items-center px-6 py-16 text-center">
              <MessagesSquare className="h-8 w-8 text-slate-600" />
              <p className="mt-3 text-sm text-slate-500">لا توجد منشورات في هذه القناة بعد.</p>
              <Link
                href="/forum"
                className="mt-4 text-sm font-medium text-brand-300 hover:text-brand-200"
              >
                العودة إلى المنتدى
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} channelSlug={channel.slug} />
              ))}
            </div>
          )}
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
