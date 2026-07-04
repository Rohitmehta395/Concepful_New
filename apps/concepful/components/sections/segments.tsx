import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SEGMENTS = [
  {
    label: "Solo Founders",
    desc: "From zero to a brand that punches above its weight. Pitch decks, landing pages, identity — done.",
    range: "Core plan",
    color: "border-rose-500/30 bg-rose-500/5",
    accent: "text-rose-500",
  },
  {
    label: "Startups",
    desc: "Build fast, look great, stay consistent. Your design partner from seed through Series B.",
    range: "Core → Studio",
    color: "border-primary/30 bg-primary/5",
    accent: "text-primary",
  },
  {
    label: "SMBs",
    desc: "Marketing that scales with your team. Campaign assets, brand systems, and ongoing creative.",
    range: "Studio plan",
    color: "border-amber-500/30 bg-amber-500/5",
    accent: "text-amber-500",
  },
  {
    label: "Mid-Market",
    desc: "An embedded creative department that thinks like your business and moves at your speed.",
    range: "Department plan",
    color: "border-violet-500/30 bg-violet-500/5",
    accent: "text-violet-500",
  },
];

export function Segments() {
  return (
    <section className="py-20 px-6 border-t border-border/40">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Built for your stage</p>
          <h2 className="font-serif text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Wherever you are, we fit in.
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            One platform, four segments. Concepful scales with you from first pitch deck to enterprise brand system.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {SEGMENTS.map(({ label, desc, range, color, accent }) => (
            <div key={label} className={cn("p-6 rounded-2xl border transition-all hover:shadow-md", color)}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-serif text-xl font-bold">{label}</h3>
                <Badge variant="outline" className={cn("text-[11px] shrink-0", accent)}>{range}</Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
