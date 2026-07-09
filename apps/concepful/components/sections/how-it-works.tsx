import React from "react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    n: "01",
    title: "Scope & commit",
    body:
      "One SOW covers scope, price, and timeline — signed and paid in a single step. Payment is the starting gun: assembly begins the same day, not after three rounds of proposals.",
  },
  {
    n: "02",
    title: "Assemble the team",
    body:
      "We match your brief to a vetted bench of specialists — senior direction here, focused production talent across time zones — sized exactly to the job. You never pay for an idle department.",
  },
  {
    n: "03",
    title: "Build around the clock",
    body:
      "Production follows the sun. While your office sleeps, specialist teams abroad are executing against the SOW — so progress lands in your inbox before your day starts.",
  },
  {
    n: "04",
    title: "Senior sign-off",
    body:
      "Nothing reaches you without a creative director's review. One accountable lead owns the outcome from kickoff to delivery — you manage a relationship, not freelancers.",
  },
];

const TIMELINE = [
  { at: "9:00 AM", label: "You send the brief", pct: 3 },
  { at: "11:30 AM", label: "SOW signed, payment confirmed", pct: 15 },
  { at: "2:00 PM", label: "Team assembled — kickoff", pct: 27 },
  {
    at: "6:00 PM – 6:00 AM",
    label: "Your project moves into production.",
    pct: 40,
    night: true,
  },
  { at: "9:00 AM +1", label: "Director review — revisions scoped", pct: 55 },
  {
    at: "6:00 PM – 6:00 AM",
    label: "Revisions and final refinements",
    pct: 73,
    night: true,
  },
  { at: "9:00 AM +2", label: "Director-reviewed work in your inbox", pct: 95 },
];

const NIGHT_BANDS = [
  { left: "33%", width: "14%" },
  { left: "66%", width: "14%" },
];

const TRUST = [
  {
    title: "One accountable lead",
    body: "A senior director owns your account end to end. One name, one number — never a rotating cast.",
  },
  {
    title: "Fixed scope, fixed price",
    body: "The SOW is the contract. What you sign is what you pay — no change-order ambush mid-project.",
  },
  {
    title: "Your IP, fully transferred",
    body: "NDA before the first call. Full ownership of every file and working asset transfers on delivery.",
  },
  {
    title: "SLA in writing",
    body: "Delivery windows are stated in the SOW and backed by an SLA — not a verbal 'should be ready by.'",
  },
  {
    title: "A bench, not a marketplace",
    body: "Every specialist has shipped with us before. We assemble proven teams — we don't post your job to a crowd.",
  },
  {
    title: "Progress you can see",
    body: "Status, files, and feedback live in one shared workspace — not scattered across email threads.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-[1120px] bg-background px-6 py-16 text-foreground font-sans"
    >
      {/* ---------- Header ---------- */}
      <div className="mx-auto max-w-[640px] text-center">
        <div className="mb-4 text-[13px] font-bold uppercase tracking-[0.15em] text-primary">
          How it works
        </div>
        <h2 className="mb-5 font-serif text-[clamp(36px,5vw,48px)] font-bold leading-[1.1] tracking-[-0.025em]">
          Fast Isn’t Luck. <span className="text-primary">It’s Logistics.</span>
        </h2>
        <p className="text-lg leading-[1.625] text-muted-foreground">
          We keep a small senior core here and a vetted network of specialists
          across time zones. Your SOW and payment happen in one step — then the
          right team is assembled for your job, and only your job.
        </p>
      </div>

      {/* ---------- Steps Grid ---------- */}
      <ol className="mt-14 grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-4 lg:border-t lg:border-border">
        {STEPS.map((s) => (
          <li
            className="border-t border-border pb-2 pr-6 pt-7 lg:border-l lg:border-t-0 lg:pl-6 lg:first:border-l-0 lg:first:pl-0"
            key={s.n}
          >
            <div className="mb-3.5 font-sans text-[13px] font-bold tabular-nums text-primary">
              {s.n}
            </div>
            <h3 className="mb-2.5 text-[17px] font-semibold tracking-[-0.01em]">
              {s.title}
            </h3>
            <p className="text-[14.5px] leading-[1.6] text-muted-foreground">
              {s.body}
            </p>
          </li>
        ))}
      </ol>

      {/* ---------- Timeline Clock ---------- */}
      <div className="mt-[72px] rounded-2xl border border-border bg-[#F7F7F8] p-7 pb-5 dark:bg-muted/50">
        <div className="mb-9 flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-base font-bold uppercase tracking-[-0.01em]">
            One brief, forty-eight hours
          </span>
          <span className="text-[13px] text-muted-foreground">
            A typical Sprint, kickoff to first delivery
          </span>
        </div>

        {/* Desktop Track */}
        <div
          className="relative hidden h-[150px] sm:block"
          role="img"
          aria-label="Timeline from brief at 9 AM to director-reviewed delivery at 9 AM two days later, with two overnight production windows abroad"
        >
          <div className="absolute left-0 right-0 top-[74px] h-[2px] bg-border" />
          {NIGHT_BANDS.map((b, i) => (
            <div
              key={i}
              className="absolute top-[62px] flex h-[26px] items-center justify-center rounded-full bg-[#1B1B2E] opacity-90"
              style={{ left: b.left, width: b.width }}
            >
              <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.06em] text-[#C9C9DE]">
                Production Phase
              </span>
            </div>
          ))}
          {TIMELINE.map((t) => (
            <div
              key={t.label}
              className="absolute bottom-0 top-0 flex w-[116px] -translate-x-1/2 flex-col items-center text-center"
              style={{ left: t.pct + "%" }}
            >
              <span className="order-1 mt-8 font-sans text-[11.5px] font-bold tabular-nums text-foreground whitespace-nowrap">
                {t.at}
              </span>
              <span
                className={`order-2 absolute top-[70px] m-0 h-2.5 w-2.5 rounded-full border-2 border-background ring-1 ${
                  t.night
                    ? "invisible bg-[#1B1B2E] opacity-0 ring-[#1B1B2E]"
                    : "bg-primary ring-primary"
                }`}
              />
              <span className="order-3 mt-[54px] max-w-[110px] text-[11px] leading-[1.35] text-muted-foreground text-balance">
                {t.label}
              </span>
            </div>
          ))}
        </div>

        {/* Mobile vertical list */}
        <ul className="mt-1 block list-none p-0 sm:hidden">
          {TIMELINE.map((t) => (
            <li
              key={t.label}
              className="flex items-start gap-3.5 border-b border-border py-3 last:border-b-0"
            >
              <span
                className={`mt-1.5 h-2.5 w-2.5 flex-none rounded-full ${
                  t.night ? "bg-[#1B1B2E]" : "bg-primary"
                }`}
              />
              <div>
                <span className="block font-sans text-xs font-bold tabular-nums">
                  {t.at}
                </span>
                <span className="mt-0.5 block text-[13.5px] text-muted-foreground">
                  {t.label}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ---------- Trust Grid ---------- */}
      <div className="mx-auto mb-8 mt-20 max-w-[640px] text-center">
        <h3 className="mb-5 font-serif text-[clamp(28px,4vw,36px)] font-bold tracking-[-0.025em]">
          The Fine Print, Up Front
        </h3>
        <p className="small text-muted-foreground">
          Everything your procurement checklist asks about — answered before you
          ask.
        </p>
      </div>
      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TRUST.map((t) => (
          <div
            className="rounded-xl border border-border p-[22px] transition-colors hover:border-muted-foreground/30"
            key={t.title}
          >
            <h4 className="mb-2 text-[15px] font-bold tracking-[-0.01em]">
              {t.title}
            </h4>
            <p className="text-[13.5px] leading-[1.55] text-muted-foreground">
              {t.body}
            </p>
          </div>
        ))}
      </div>

      {/* ---------- CTA ---------- */}
      <div className="mt-16 flex flex-wrap items-center justify-between gap-5 border-t border-border pt-8">
        <p className="text-[17px] font-semibold tracking-[-0.01em]">
          Scope your first project today — kickoff within 48 hours.
        </p>
        <Button
          size="lg"
          className="h-10 px-4 text-[15px] font-semibold"
          asChild
        >
          <a href="#plan-selector">Get Started</a>
        </Button>
      </div>
    </section>
  );
}
