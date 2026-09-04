import { badgeMeta } from "@/lib/brokers";

/** Renders a broker's marketing badges as animated chips. */
export function BrokerBadges({
  badges,
  size = "sm",
}: {
  badges?: string[] | null;
  size?: "sm" | "md";
}) {
  const list = (badges ?? []).map((k) => badgeMeta(k)).filter(Boolean);
  if (list.length === 0) return null;

  const pad = size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[10px]";

  return (
    <div className="flex flex-wrap gap-1.5">
      {list.map((b, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1 rounded-full ring-1 ${pad} ${b!.className} animate-badge-pulse`}
        >
          <span>{b!.emoji}</span>
          {b!.label}
        </span>
      ))}
    </div>
  );
}
