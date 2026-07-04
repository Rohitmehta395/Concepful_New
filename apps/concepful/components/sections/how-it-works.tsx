"use client";

import { motion } from "framer-motion";
import { Zap, FileText, Clock } from "lucide-react";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Pick your plan",
    desc: "Choose creative bandwidth that matches your pace — like picking a data plan. Takes 2 minutes.",
    icon: Zap,
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
      className="border-t border-border/40 py-20 px-6"
      style={{ background: "hsl(232, 28%, 11%)" }}
    >
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Simple process</p>
          <h2 className="font-serif text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
            Up and running in 24 hours
          </h2>
          <p className="text-white/50 max-w-md mx-auto">
            The entire purchase and onboarding can be completed on your phone in under five minutes.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="relative p-6 rounded-2xl border border-white/10 bg-white/5"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-4xl font-bold tabular-nums text-white/10 font-serif">{step}</span>
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
