"use client";

import { motion } from "framer-motion";

interface AnimatedHeroCardProps {
  gradient?: string;
  accentColor?: string;
  tags: string[];
}

export function AnimatedHeroCard({ tags }: AnimatedHeroCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative h-52 md:h-72 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-neutral-900 to-zinc-950 border border-border/40 shadow-sm"
    >
      {/* Subtle neutral ambient glow */}
      <div className="absolute top-8 right-12 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full border border-white/10" />

      {/* Tags */}
      <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/40 text-white/80 backdrop-blur-sm border border-white/10"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
