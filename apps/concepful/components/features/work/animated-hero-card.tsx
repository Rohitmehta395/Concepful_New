"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedHeroCardProps {
  gradient: string;
  accentColor: string;
  tags: string[];
}

export function AnimatedHeroCard({ gradient, accentColor, tags }: AnimatedHeroCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative h-52 md:h-72 rounded-3xl overflow-hidden bg-gradient-to-br",
        gradient
      )}
    >
      {/* Decorative circles */}
      <div className="absolute top-8 right-12 h-32 w-32 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: accentColor }} />
      <div className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full opacity-10" style={{ backgroundColor: accentColor }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full opacity-10 border-2" style={{ borderColor: accentColor }} />

      {/* Tags */}
      <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/30 text-white/80 backdrop-blur-sm"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
