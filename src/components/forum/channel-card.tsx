import { Link } from "@/i18n/navigation";
import { BadgeCheck, Radio, MessagesSquare } from "lucide-react";
import type { Channel } from "@/lib/forum";
import { Avatar } from "@/components/forum/avatar";

/** Card linking to a forum channel (official or agent). */
export function ChannelCard({ channel }: { channel: Channel }) {
  const official = channel.kind === "official";
  return (
    <Link
      href={`/forum/${channel.slug}`}
      className="card-surface group flex flex-col gap-3 p-5 transition hover:border-brand-500/40"
    >
      <div className="flex items-center gap-3">
        <Avatar name={channel.owner_name || channel.name} src={channel.cover_image} size={44} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold text-white group-hover:text-brand-200">
              {channel.name}
            </h3>
            {official ? (
              <BadgeCheck className="h-4 w-4 shrink-0 text-brand-300" aria-label="قناة رسمية" />
            ) : (
              <Radio className="h-4 w-4 shrink-0 text-gold-400" aria-label="قناة وكيل" />
            )}
          </div>
          <p className="truncate text-xs text-slate-500">
            {official ? "قناة رسمية · FX Partners" : channel.owner_name || "وكيل معتمد"}
          </p>
        </div>
      </div>
      {channel.description && (
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">
          {channel.description}
        </p>
      )}
      <div className="mt-auto flex items-center gap-1.5 pt-1 text-xs text-slate-500">
        <MessagesSquare className="h-3.5 w-3.5" />
        {channel.post_count ?? 0} منشور
      </div>
    </Link>
  );
}
