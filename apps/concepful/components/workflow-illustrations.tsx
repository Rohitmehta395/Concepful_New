"use client";

import { cn } from "@/lib/utils";

/**
 * Hand-built illustrations for the workflow section: "You Request" and
 * "You Grow" bookend a single, deliberately larger "We Create & Deliver"
 * card. Design and delivery are one continuous step in how Concepful
 * actually works, so this collapses what used to be two same-size boxes
 * into the one thing that should visually dominate the row.
 */

const GROWTH_STATS = [
  {
    label: "More Conversions",
    value: "+120%",
    path: "M2 22 L14 16 L26 18 L38 8 L50 10 L62 2",
  },
  {
    label: "Better Engagement",
    value: "+90%",
    path: "M2 20 L14 14 L26 17 L38 12 L50 9 L62 4",
  },
  {
    label: "Stronger Brand",
    value: "+100%",
    path: "M2 23 L14 19 L26 15 L38 16 L50 7 L62 3",
  },
];

const DELIVERABLES: Array<{ label: string; tone: "muted" | "primary" }> = [
  { label: "Brand Guidelines", tone: "muted" },
  { label: "Social Kit", tone: "primary" },
  { label: "Mobile Screens", tone: "muted" },
];

/** Step 1 — a compact request/reply chat card. */
export function RequestIllustration() {
  return (
    <div className="w-full max-w-full sm:max-w-[260px] rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
          C
        </span>
        <div>
          <p className="text-sm font-semibold text-white">Concepful</p>
          <p className="text-xs text-white/50">What do you need?</p>
        </div>
      </div>
      <div className="rounded-xl bg-white/[0.06] p-4 text-sm leading-relaxed text-white/70">
        We need a new landing page for our product. Clean, modern and conversion
        focused.
      </div>
    </div>
  );
}

/**
 * Step 2 — the featured card. A browser-window mockup (the design) sitting
 * directly on top of a deliverables strip (the handoff), so the single card
 * visually tells "we create, and here's what actually lands in your inbox."
 */
export function CreateAndDeliverIllustration() {
  return (
    <div className="w-full max-w-[480px] overflow-hidden rounded-3xl border border-white/10 bg-white text-left shadow-2xl shadow-primary/25">
      {/* Browser chrome */}
      <div className="flex items-center justify-between border-b border-black/5 bg-neutral-50 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
          <span
            className="h-1.5 w-1.5 rounded-full bg-emerald-500"
            aria-hidden="true"
          />
          Live preview
        </span>
      </div>

      {/* Site header — kept deliberately simple (logo + one CTA) so it never
          fights for space the way a full nav row would at this width. */}
      <div className="flex items-center justify-between px-5 pt-4">
        <span className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-neutral-900">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] text-white">
            C
          </span>
          Concepful
        </span>
        <span className="shrink-0 whitespace-nowrap rounded-full bg-neutral-900 px-3 py-1 text-[10px] font-semibold text-white">
          Contact Us
        </span>
      </div>

      {/* Headline + abstract product visual */}
      <div className="flex flex-col gap-5 px-5 pb-5 pt-4 sm:flex-row sm:items-center">
        <div className="sm:flex-1">
          <h3 className="text-lg font-bold leading-snug text-neutral-900 sm:text-xl">
            Elevate Your Brand
            <br />
            With <span className="text-primary">Powerful Design</span>
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            Strategy, design and development working together to grow your
            brand.
          </p>
          <div className="mt-4 flex items-center gap-2.5">
            <span className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-white">
              Get Started
            </span>
            <span className="text-[11px] font-medium text-neutral-500">
              See our work
            </span>
          </div>
        </div>

        <div className="relative h-28 w-full sm:h-28 sm:flex-1">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/25 via-primary/10 to-transparent" />
          <div className="absolute right-3 top-2 h-20 w-14 rounded-xl border border-primary/20 bg-white shadow-lg" />
          <div className="absolute bottom-2 right-8 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-lg">
            C
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-neutral-100" />

      {/* Deliverables strip — the "and delivered" half of this step */}
      <div className="grid grid-cols-3 gap-2.5 bg-neutral-50/60 p-3">
        {DELIVERABLES.map((item) => (
          <DeliverableChip
            key={item.label}
            label={item.label}
            tone={item.tone}
          />
        ))}
      </div>
    </div>
  );
}

function DeliverableChip({
  label,
  tone,
}: {
  label: string;
  tone: "muted" | "primary";
}) {
  const isPrimary = tone === "primary";
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-center",
        isPrimary
          ? "border-transparent bg-gradient-to-br from-primary to-primary/70 text-white"
          : "border-black/5 bg-white text-neutral-600",
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
          isPrimary ? "bg-white/20 text-white" : "bg-primary text-white",
        )}
      >
        C
      </span>
      <p className="text-[10px] font-medium leading-tight">{label}</p>
    </div>
  );
}

/** Step 3 — stacked stat cards with sparkline trend lines. */
export function GrowIllustration() {
  return (
    <div className="flex w-full max-w-full sm:max-w-[260px] flex-col gap-2.5 text-left">
      {GROWTH_STATS.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
        >
          <div>
            <p className="text-xs text-white/60">{stat.label}</p>
            <p className="text-lg font-bold text-emerald-400">{stat.value}</p>
          </div>
          <svg
            width="64"
            height="24"
            viewBox="0 0 64 24"
            fill="none"
            aria-hidden="true"
            className="text-emerald-400"
          >
            <path
              d={stat.path}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
