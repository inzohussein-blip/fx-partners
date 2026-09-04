"use client";

import dynamic from "next/dynamic";

/** Client-side lazy chart: keeps lightweight-charts out of the initial bundle. */
export const MarketsLazy = dynamic(
  () => import("@/components/marketing/markets").then((m) => m.Markets),
  {
    ssr: false,
    loading: () => <div className="py-24" aria-hidden />,
  }
);
