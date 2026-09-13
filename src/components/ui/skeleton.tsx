import { cn } from "@/lib/utils";

/** Pulsing placeholder block used inside route loading states. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-fg/5", className)}
      aria-hidden
    />
  );
}
