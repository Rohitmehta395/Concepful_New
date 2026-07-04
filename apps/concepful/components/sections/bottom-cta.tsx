"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function BottomCta() {
  return (
    <section
      className="py-20 px-6 text-center"
      style={{ background: "hsl(232, 28%, 11%)" }}
    >
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-5">
            Stop hiring.<br />Start creating.
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-md mx-auto">
            Add a creative department to your company today. Cancel anytime.
          </p>
          <Button
            asChild
            size="lg"
            className="h-14 px-10 text-base font-semibold"
            style={{ backgroundColor: "hsl(349, 90%, 54%)" }}
          >
            <Link href="#plan-selector">
              Choose your plan <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
