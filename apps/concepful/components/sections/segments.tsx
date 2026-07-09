"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const SEGMENTS = [
  {
    label: "Solo Founders",
    range: "Core plan",
    desc: "From zero to a brand that punches above its weight. Pitch decks, landing pages, identity — done.",
    image:
      "https://images.unsplash.com/photo-1755436612913-b1e2cfd66e66?q=80&w=500&auto=format&fit=crop",
    alt: "A single desk with a laptop and a plant, set up for focused, solo work.",
    rotate: "-rotate-3",
    tape: "left-4 -rotate-6",
  },
  {
    label: "Startups",
    range: "Core → Studio",
    desc: "Build fast, look great, stay consistent. Your design partner from seed through Series B.",
    image:
      "https://images.unsplash.com/photo-1758873268745-dd2cf0d677b5?q=80&w=500&auto=format&fit=crop",
    alt: "A small team gathered around a laptop, pointing at the screen together.",
    rotate: "rotate-2",
    tape: "right-4 rotate-6",
  },
  {
    label: "SMBs",
    range: "Studio plan",
    desc: "Marketing that scales with your team. Campaign assets, brand systems, and ongoing creative.",
    image:
      "https://images.unsplash.com/photo-1758518731706-be5d5230e5a5?q=80&w=500&auto=format&fit=crop",
    alt: "A group of colleagues discussing a project around a table in a modern office.",
    rotate: "-rotate-2",
    tape: "left-4 -rotate-6",
  },
  {
    label: "Mid-Market",
    range: "Department plan",
    desc: "An embedded creative department that thinks like your business and moves at your speed.",
    image:
      "https://images.unsplash.com/photo-1716703373229-b0e43de7dd5c?q=80&w=500&auto=format&fit=crop",
    alt: "A large open-plan office floor with many desks, representing a full creative department.",
    rotate: "rotate-3",
    tape: "right-4 rotate-6",
  },
] as const;

// Uniform print size for every card — the progression reads through the
// plan labels and copy, not through the photo dimensions.
const PRINT_SIZE = "w-full max-w-[220px]";

export function Segments() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="border-t border-border/40 px-6 py-24">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.15em] text-primary">
            Built for your stage
          </p>
          <h2 className="mb-3 font-serif text-4xl font-bold tracking-tight md:text-5xl">
            Wherever You Are, We Fit In.
          </h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            One platform, four segments. Concepful scales with you from first
            pitch deck to enterprise brand system.
          </p>
        </div>

        {/* The growth line — four real workspaces, printed, taped, and hung
            in sequence. Replaces the abstract bar chart with an actual
            pinned-photo artifact. */}
        <div className="relative pt-10">
          <div
            className="absolute inset-x-0 top-10 hidden border-t border-dashed border-border/70 lg:block"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 items-start gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
            {SEGMENTS.map((seg, i) => (
              <motion.div
                key={seg.label}
                {...(!shouldReduceMotion && {
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, margin: "-80px" },
                  transition: {
                    duration: 0.5,
                    delay: i * 0.08,
                    ease: "easeOut",
                  },
                })}
                className="flex flex-col items-center"
              >
                <div
                  className={cn(
                    "relative mx-auto shrink-0 rounded-[2px] bg-[#f4efe4] p-2.5 pb-4 shadow-md transition-transform duration-300 hover:rotate-0 hover:scale-[1.03]",
                    PRINT_SIZE,
                    seg.rotate,
                  )}
                >
                  {/* Washi tape pinning the print to the line above */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -top-3 h-5 w-11 bg-primary/70",
                      seg.tape,
                    )}
                    style={{
                      clipPath: "polygon(0 12%, 100% 0, 100% 88%, 0% 100%)",
                    }}
                  />

                  <div className="aspect-[4/5] w-full overflow-hidden bg-muted">
                    <img
                      src={seg.image}
                      alt={seg.alt}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <p className="mt-5 mb-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                  {seg.range}
                </p>
                <h3 className="mb-1 font-serif text-lg font-semibold tracking-tight">
                  {seg.label}
                </h3>
                <p className="max-w-[220px] text-center text-sm leading-relaxed text-muted-foreground">
                  {seg.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
