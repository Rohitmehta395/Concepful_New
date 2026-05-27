import { cn } from "@/lib/utils";

const PALETTES: Record<string, { bg: string; accent: string; shape: string }> = {
  campaign:     { bg: "from-amber-400/25 to-rose-400/10",   accent: "bg-amber-400",    shape: "★" },
  social:       { bg: "from-primary/20 to-rose-300/10",     accent: "bg-primary",      shape: "◈" },
  email:        { bg: "from-blue-400/22 to-cyan-300/10",    accent: "bg-blue-400",     shape: "◉" },
  strategy:     { bg: "from-slate-400/15 to-slate-300/5",   accent: "bg-slate-400",    shape: "▦" },
  presentation: { bg: "from-purple-400/22 to-violet-300/8", accent: "bg-purple-400",   shape: "◧" },
  motion:       { bg: "from-emerald-400/22 to-teal-300/8",  accent: "bg-emerald-400",  shape: "▶" },
  web:          { bg: "from-cyan-400/22 to-sky-300/8",      accent: "bg-cyan-400",     shape: "⬡" },
};

const FALLBACK = { bg: "from-border/30 to-transparent", accent: "bg-border", shape: "◈" };

export function ArtworkThumbnail({
  category,
  title,
  className,
}: {
  category?: string | null;
  title: string;
  className?: string;
}) {
  const key = (category ?? "").toLowerCase().trim();
  const p = PALETTES[key] ?? FALLBACK;
  const initials = title
    .split(" ")
    .filter(Boolean)
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br flex flex-col items-center justify-center select-none",
        p.bg,
        className
      )}
    >
      {/* Background geometric shapes */}
      <div className={cn("absolute top-1.5 right-2 w-6 h-6 rounded-sm rotate-12 opacity-25", p.accent)} />
      <div className={cn("absolute bottom-2 left-2 w-4 h-4 rounded-full opacity-20", p.accent)} />
      <div className={cn("absolute top-1/2 right-1/4 w-1.5 h-8 rounded-sm -translate-y-1/2 opacity-15", p.accent)} />
      <div className={cn("absolute -bottom-1 -left-1 w-8 h-8 rounded-full opacity-10", p.accent)} />

      {/* Initials + symbol */}
      <span className="relative z-10 text-xs font-bold text-foreground/60 tracking-wider leading-none">{initials}</span>
      <span className="relative z-10 text-[10px] text-foreground/30 mt-1 leading-none">{p.shape}</span>
    </div>
  );
}
