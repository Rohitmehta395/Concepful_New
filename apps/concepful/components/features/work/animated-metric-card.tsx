"use client";

import { motion } from "framer-motion";

interface AnimatedMetricCardProps {
  label: string;
  value: string;
  accentColor?: string;
  index: number;
}

export function AnimatedMetricCard({
  label,
  value,
  index,
}: AnimatedMetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
    >
      <p className="text-2xl font-bold leading-none mb-2 font-serif text-foreground">
        {value}
      </p>
      <p className="text-xs text-muted-foreground leading-snug">{label}</p>
    </motion.div>
  );
}
