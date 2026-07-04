import { Layers, Palette, Globe, Megaphone, Monitor, PenTool, Lightbulb, FileText, Sparkles } from "lucide-react";

const CAPABILITIES = [
  { icon: Monitor,    label: "Product Design" },
  { icon: Layers,     label: "UI / UX Design" },
  { icon: Globe,      label: "Web Design" },
  { icon: Palette,    label: "Brand Identity" },
  { icon: Megaphone,  label: "Campaigns" },
  { icon: FileText,   label: "Presentations" },
  { icon: PenTool,    label: "Creative Direction" },
  { icon: Lightbulb,  label: "Concept Development" },
  { icon: Sparkles,   label: "Marketing Assets" },
];

export function Capabilities() {
  return (
    <section className="py-16 px-6 border-b border-border/40">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">What you can build</p>
          <h2 className="font-serif text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            One team. Every creative discipline.
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            We're not selling deliverables — we're selling creative capability. Your team handles whatever you need, as you need it.
          </p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-9 gap-3 md:gap-4">
          {CAPABILITIES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/40 hover:border-primary/30 transition-all text-center group"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <Icon className="h-4.5 w-4.5 text-primary" strokeWidth={1.75} />
              </div>
              <p className="text-xs font-medium leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
