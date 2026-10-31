"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A broker or partner logo that never shows a broken-image icon: if the file
 * fails to load, the name's first letter takes its place, in the same box
 * (same classes) and in the brand colour.
 */
export function LogoImg({
  src,
  name,
  alt,
  className,
  loading = "lazy",
  letterClassName = "text-sm",
}: {
  src: string;
  name: string;
  /** Defaults to the name; pass "" when the name is already written next to it. */
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
  /** Text size of the fallback letter, to suit the box. */
  letterClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span
        className={cn(
          className,
          "inline-grid aspect-square place-items-center bg-brand-500/10 font-bold leading-none text-brand-300",
          letterClassName
        )}
        role={alt === "" ? undefined : "img"}
        aria-label={alt === "" ? undefined : alt ?? name}
        aria-hidden={alt === "" ? true : undefined}
      >
        {initial(name)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? name}
      loading={loading}
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
      // A server-rendered image can fail before React hydrates, when its
      // onError is not attached yet; catch that case as soon as it mounts.
      ref={(el) => {
        if (el?.complete && el.naturalWidth === 0) setFailed(true);
      }}
    />
  );
}

/** First letter of the name, skipping punctuation; Arabic and Latin alike. */
export function initial(name: string): string {
  const m = name.trim().match(/[\p{L}\p{N}]/u);
  return m ? m[0].toUpperCase() : "•";
}
