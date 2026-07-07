import { cn } from "@/lib/utils";

const SEGMENTS = [
  {
    label: "Solo Founders",
    desc: "From zero to a brand that punches above its weight. Pitch decks, landing pages, identity — done.",
    range: "Core plan",
  },
  {
    label: "Startups",
    desc: "Build fast, look great, stay consistent. Your design partner from seed through Series B.",
    range: "Core → Studio",
  },
  {
    label: "SMBs",
    desc: "Marketing that scales with your team. Campaign assets, brand systems, and ongoing creative.",
    range: "Studio plan",
  },
  {
    label: "Mid-Market",
    desc: "An embedded creative department that thinks like your business and moves at your speed.",
    range: "Department plan",
  },
];

// Ascending height + intensity, index-matched to SEGMENTS — the visual
// growth path from solo founder to mid-market.
const BAR_HEIGHTS = ["h-4", "h-8", "h-12", "h-16"];
const BAR_TONES = [
  "bg-primary/20",
  "bg-primary/40",
  "bg-primary/70",
  "bg-primary",
];

export function Segments() {
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

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {SEGMENTS.map((seg) => (
            <div key={seg.label}>
              <h3 className="mb-1 font-serif text-lg font-bold tracking-tight">
                {seg.label}
              </h3>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-primary">
                {seg.range}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {seg.desc}
              </p>
            </div>
          ))}
        </div>

        {/* The growth axis — decorative reinforcement of the progression,
            so it's cut on small screens rather than forced into an awkward
            stacked layout where it wouldn't read clearly anyway. */}
        <div
          className="mt-14 hidden items-end justify-items-center gap-8 border-t border-border/60 pt-10 lg:grid lg:grid-cols-4"
          aria-hidden="true"
        >
          {SEGMENTS.map((seg, i) => (
            <div
              key={seg.label}
              className={cn(
                "w-full max-w-[100px] rounded-t-md transition-all duration-300",
                BAR_HEIGHTS[i],
                BAR_TONES[i],
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
