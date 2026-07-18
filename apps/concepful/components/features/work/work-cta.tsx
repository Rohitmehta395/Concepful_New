import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function WorkCTA() {
  return (
    <section className="relative overflow-hidden border-t border-border/40 px-6 py-20 md:py-24">
      {/* subtle background glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="container relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-5 inline-flex rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur">
            Limited client availability
          </span>

          <h2 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            Your next case study starts here.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Work with Concepful as your on-demand creative department. Strategy,
            design, and execution—without agency overhead or endless project
            management.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/pricing"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-medium text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20"
            >
              View Plans
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>

            <Link
              href="/contact"
              className="rounded-xl border border-border bg-background px-6 py-3.5 font-medium transition-colors hover:bg-muted"
            >
              Book a Discovery Call
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
