/**
 * Flow configurations for each tier.
 *
 * Each flow is exactly 5 steps. Steps are plain data objects — no JSX.
 * Adding a new question type = add a new StepType + new step component.
 * The StepRenderer factory never needs to change for new question options.
 */
import type { StepConfig } from "@/types/pricing-builder";
import {
  OUTCOMES,
  READINESS,
  TIMELINE_DRIVERS,
  EXISTS,
  MONTH_SHAPE,
  AUGMENTING,
  DECIDERS,
  COLLAB,
  CADENCE,
} from "./builder-categories";

export const BUILDER_FLOWS: Readonly<
  Record<"sprint" | "expedition" | "cdaas", readonly StepConfig[]>
> = {
  sprint: [
    {
      id: "focus",
      type: "focus",
      title: "What are we building?",
      sub: "Pick the category — then the specific slice. Multi-select if the work spans areas.",
    },
    {
      id: "outcome",
      type: "single",
      title: "What does success look like?",
      options: OUTCOMES,
    },
    {
      id: "readiness",
      type: "single",
      title: "Where are you starting from?",
      sub: "Helps us understand how much foundation work lands in scope.",
      options: READINESS,
      col: true,
    },
    {
      id: "addons",
      type: "addons",
      title: "Any specialist boosts?",
      sub: "Optional. Priced transparently — added to your fixed fee.",
    },
    {
      id: "docs",
      type: "docs",
      title: "Brief & reference materials",
      sub: "Upload anything useful — brief, deck, sketches, links doc. We review before your final quote.",
    },
  ],

  expedition: [
    {
      id: "focus",
      type: "focus",
      title: "What are we building?",
      sub: "Pick the category — then the specific slice. Multi-select if the work spans areas.",
    },
    {
      id: "outcome_driver",
      type: "dual",
      title: "What must this achieve — and by when?",
      a: { key: "outcome", label: "The outcome", options: OUTCOMES },
      b: { key: "driver", label: "The deadline behind it", options: TIMELINE_DRIVERS },
    },
    {
      id: "exists",
      type: "single",
      title: "What exists today?",
      sub: "Research, designs, prototypes, code — where does the expedition start from?",
      options: EXISTS,
      col: true,
    },
    {
      id: "addons",
      type: "addons",
      title: "Enhancements",
      sub: "AI infrastructure and specialist talent. Priced transparently, adjusted after we review your materials.",
    },
    {
      id: "teamdocs",
      type: "teamdocs",
      title: "Team & materials",
      a: { key: "decider", label: "Who signs off?", options: DECIDERS },
      b: { key: "involved", label: "Who's involved?", options: COLLAB, multi: true },
    },
  ],

  cdaas: [
    {
      id: "streams",
      type: "streams",
      title: "What will we own?",
      sub: "Select the ongoing streams your department covers. You can adjust these any month.",
    },
    {
      id: "month",
      type: "single",
      title: "What does a typical month look like?",
      options: MONTH_SHAPE,
      col: true,
    },
    {
      id: "augment",
      type: "dual",
      title: "Who are we augmenting?",
      a: { key: "team", label: "Your team today", options: AUGMENTING },
      b: { key: "cadence", label: "How we should communicate", options: CADENCE },
    },
    {
      id: "addons",
      type: "addons",
      title: "Enhancements",
      sub: "AI infrastructure and specialist talent, added to your retainer. Every price is visible before you commit.",
    },
    {
      id: "teamdocs",
      type: "teamdocs",
      title: "Team & materials",
      a: { key: "decider", label: "Who signs off?", options: DECIDERS },
      b: { key: "involved", label: "Who's involved?", options: COLLAB, multi: true },
    },
  ],
};
