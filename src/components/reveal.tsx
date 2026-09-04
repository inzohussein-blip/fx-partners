"use client";

import { motion } from "framer-motion";

/**
 * Fades/slides its children in when they scroll into view — the subtle
 * reveal that distinguishes polished FinTech sites. Respects reduced motion
 * via Framer Motion's built-in handling.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
