/** Small circular avatar: image if present, otherwise a gradient initial. */
export function Avatar({
  name,
  src,
  size = 36,
}: {
  name?: string | null;
  src?: string | null;
  size?: number;
}) {
  const initial = (name?.trim()?.[0] ?? "؟").toUpperCase();
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name ?? ""}
        width={size}
        height={size}
        className="rounded-full border border-white/10 object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full bg-brand-gradient font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial}
    </span>
  );
}

/** Localized short date (Arabic). */
export function formatForumDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ar", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return "";
  }
}
