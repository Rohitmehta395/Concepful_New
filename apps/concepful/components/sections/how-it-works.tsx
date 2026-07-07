"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { NotebookPen, FileText, Clock } from "lucide-react";


const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Pick your plan",
    desc: "Choose creative bandwidth that matches your pace — like picking a data plan. Takes 2 minutes.",
    icon: NotebookPen,
  },
  {
    step: "02",
    title: "Submit your first brief",
    desc: "Use our simple request form on any device. Describe what you need — we'll handle the rest.",
    icon: FileText,
  },
  {
    step: "03",
    title: "Get work back, fast",
    desc: "Receive polished, on-brand creative within your SLA. Revise, approve, and keep moving.",
    icon: Clock,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-t border-border/40 bg-[hsl(232,28%,11%)] px-6 py-24"
    >
      <div className="container mx-auto max-w-5xl">
        <div className="mb-20 text-center">
          <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.15em] text-primary">
            Simple process
          </p>
          <h2 className="mb-3 font-serif text-4xl font-bold tracking-tight text-white md:text-5xl">
            Up And Running In 24 Hours
          </h2>
          <p className="mx-auto max-w-md text-white/50">
            The entire purchase and onboarding can be completed on your phone in
            under five minutes.
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
          {/* The rail — spans center-to-center of the first and last node.
              Hidden on mobile, where the steps stack vertically instead. */}
          <motion.div
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ transformOrigin: "left" }}
            className="absolute left-[16.6%] right-[16.6%] top-6 hidden h-px bg-primary/25 md:block"
          />

          {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }, i) => (
            <Fragment key={step}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Node — background matches the section so the rail reads
                    as passing behind it, not overlapping it. */}
                <span className="relative z-10 mb-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-[hsl(232,28%,11%)] font-serif text-base font-bold text-primary">
                  {step}
                </span>
                <div className="mb-2 flex items-center gap-2">
                  <Icon
                    className="h-4 w-4 text-primary/70"
                    aria-hidden="true"
                  />
                  <h3 className="font-semibold text-white">{title}</h3>
                </div>
                <p className="max-w-[260px] text-sm leading-relaxed text-white/50">
                  {desc}
                </p>
              </motion.div>

              {/* Vertical connector between stacked steps on mobile only —
                  display:none at md+ removes it from grid flow entirely,
                  so it doesn't affect the 3-column desktop layout. */}
              {i < HOW_IT_WORKS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="mx-auto h-8 w-px bg-gradient-to-b from-primary/25 to-transparent md:hidden"
                />
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
