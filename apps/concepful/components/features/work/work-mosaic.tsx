"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CASE_STUDIES, CATEGORY_FILTERS } from "@/data/case-studies";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

const MOSAIC_CONFIG: Record<string, string> = {
  large:  "col-span-2 row-span-2",
  wide:   "col-span-2 row-span-1",
  tall:   "col-span-1 row-span-2",
  square: "col-span-1 row-span-1",
};

const ROW_HEIGHT = "minmax(180px, 1fr)";

export function WorkMosaic() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = CASE_STUDIES.filter(
    cs => activeFilter === "all" || cs.category === activeFilter
  );

  return (
    <>
      {/* Filters */}
      <section className="sticky top-16 z-30 bg-background/90 backdrop-blur border-b border-border/40 px-6 py-3">
        <div className="container mx-auto max-w-5xl flex items-center gap-2 flex-wrap">
          {CATEGORY_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                "text-sm font-medium px-4 py-1.5 rounded-full border transition-all duration-150",
                activeFilter === f.id
                  ? "bg-foreground text-background border-foreground"
                  : "border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/30"
              )}
            >
              {f.label}
              {f.id !== "all" && (
                <span className="ml-1.5 opacity-40 text-xs tabular-nums">
                  {CASE_STUDIES.filter(cs => cs.category === f.id).length}
                </span>
              )}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground tabular-nums hidden sm:block">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </section>

      {/* Mosaic */}
      <section className="px-6 py-10">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 gap-3"
            style={{ gridAutoRows: ROW_HEIGHT }}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((cs) => (
                <motion.button
                  key={cs.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.22 }}
                  onClick={() => router.push(`/work/${cs.slug}`)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    MOSAIC_CONFIG[cs.mosaic]
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-105",
                    cs.gradient
                  )} />
                  <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff fill-opacity=1%3E%3Cpath d=M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
                  <div className="absolute top-4 right-4 h-12 w-12 rounded-full opacity-20 blur-xl" style={{ backgroundColor: cs.accentColor }} />
                  <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full opacity-10" style={{ backgroundColor: cs.accentColor }} />

                  <div className="relative z-10 h-full flex flex-col justify-between p-5 md:p-6">
                    <div className="flex items-start justify-between">
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border"
                        style={{ color: cs.accentColor, borderColor: `${cs.accentColor}40`, backgroundColor: `${cs.accentColor}15` }}
                      >
                        {cs.categoryLabel}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-white/40 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <div>
                      <p className="text-white/50 text-xs mb-1.5">{cs.client}</p>
                      <h2 className="font-serif text-white font-bold leading-tight text-lg md:text-xl line-clamp-2">{cs.title}</h2>
                      <p className="text-white/60 text-xs mt-2 leading-relaxed line-clamp-2 hidden md:block">{cs.teaser}</p>
                    </div>
                  </div>

                  <div
                    className="absolute inset-0 rounded-2xl border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ borderColor: `${cs.accentColor}60` }}
                  />
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-24">
              <p className="text-muted-foreground">No projects in this category yet.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
