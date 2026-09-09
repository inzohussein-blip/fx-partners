"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

type Tab = { id: string; label: string };

/**
 * Sticky in-page tab bar for the broker profile. Anchor links smooth-scroll to
 * each section; an IntersectionObserver highlights the section in view.
 * `tabs` is filtered to sections that actually rendered (ids present in DOM).
 */
export function BrokerTabs({ tabs }: { tabs: Tab[] }) {
  const [present, setPresent] = useState<Tab[]>(tabs);
  const [active, setActive] = useState<string>(tabs[0]?.id ?? "");

  useEffect(() => {
    const found = tabs.filter((t) => document.getElementById(t.id));
    setPresent(found);
    if (found.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 }
    );
    found.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [tabs]);

  if (present.length < 2) return null;

  return (
    <nav className="sticky top-16 z-30 border-y border-white/[0.06] bg-ink-900/85 backdrop-blur">
      <Container>
        <ul className="no-scrollbar -mb-px flex gap-1 overflow-x-auto">
          {present.map((t) => {
            const on = active === t.id;
            return (
              <li key={t.id} className="shrink-0">
                <a
                  href={`#${t.id}`}
                  className={cn(
                    "inline-flex items-center border-b-2 px-4 py-3.5 text-sm font-semibold transition",
                    on
                      ? "border-brand-400 text-brand-200"
                      : "border-transparent text-slate-400 hover:text-white"
                  )}
                >
                  {t.label}
                </a>
              </li>
            );
          })}
        </ul>
      </Container>
    </nav>
  );
}
