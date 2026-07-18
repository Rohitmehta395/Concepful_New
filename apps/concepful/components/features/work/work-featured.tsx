import Link from "next/link";
import { CaseStudy } from "@/data/case-studies";

interface WorkFeaturedProps {
  caseStudies: CaseStudy[];
}

/** Converts a hex color (e.g. "#F97316") to an rgba() string at the given alpha. */
function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const parsed = parseInt(full, 16);
  if (full.length !== 6 || Number.isNaN(parsed))
    return `rgba(120, 120, 130, ${alpha})`;
  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function WorkFeatured({ caseStudies }: WorkFeaturedProps) {
  if (!caseStudies || caseStudies.length === 0) return null;

  const [lead, ...rest] = caseStudies;

  return (
    <section className="border-b border-border/40 px-6 py-20 md:py-16">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-4 flex items-center gap-3">
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary"
            aria-hidden="true"
          />
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            Featured
          </p>
        </div>
        <h2 className="mb-10 font-serif text-3xl font-bold tracking-tight md:text-4xl">
          Featured projects
        </h2>

        {/* Lead story — the one piece that earns full-bleed treatment */}
        <LeadCard study={lead} />

        {/* Supporting list — smaller by design, so the lead reads as a choice, not an accident */}
        {rest.length > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {rest.map((study, i) => (
              <SecondaryCard key={study.slug} study={study} index={i + 2} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ———————————————————————————————————————————————— */

function LeadCard({ study }: { study: CaseStudy }) {
  const accent = study.accentColor;

  return (
    <Link
      href={`/work/${study.slug}`}
      aria-label={`View ${study.title} case study`}
      className="group grid grid-cols-1 overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-500 ease-out hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:grid-cols-2"
      style={{
        boxShadow: `0 2px 12px -4px ${hexToRgba(accent, 0.18)}, 0 28px 56px -24px ${hexToRgba(
          accent,
          0.34,
        )}, 0 8px 20px -10px rgba(15, 15, 20, 0.12)`,
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted md:aspect-auto">
        <img
          src={study.image}
          alt={study.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `linear-gradient(180deg, transparent 55%, ${hexToRgba(accent, 0.28)} 100%)`,
          }}
        />
        <span className="absolute left-4 top-4 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
          Featured
        </span>
      </div>

      <div className="flex flex-col justify-center p-8 md:p-10">
        <span
          className="mb-4 block h-[3px] w-9 rounded-full"
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        />
        <p
          className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: accent }}
        >
          {study.categoryLabel}
        </p>
        <h3 className="mb-2 font-serif text-2xl font-bold leading-snug text-foreground md:text-3xl">
          {study.title}
        </h3>
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
          {study.client}
        </p>
        <p className="mb-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          {study.teaser}
        </p>
        <span className="flex w-fit items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition-all duration-300 group-hover:gap-2.5">
          View case study
          <svg
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          >
            <path
              d="M3 13L13 3M13 3H5M13 3v8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}

function SecondaryCard({ study, index }: { study: CaseStudy; index: number }) {
  const accent = study.accentColor;

  return (
    <Link
      href={`/work/${study.slug}`}
      aria-label={`View ${study.title} case study`}
      className="group flex gap-4 rounded-lg border border-border/60 bg-card p-3 transition-all duration-500 ease-out hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      style={{
        boxShadow: `0 2px 8px -4px ${hexToRgba(accent, 0.14)}, 0 16px 32px -20px ${hexToRgba(
          accent,
          0.24,
        )}, 0 4px 12px -6px rgba(15, 15, 20, 0.08)`,
      }}
    >
      <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-md bg-muted sm:w-28">
        <img
          src={study.image}
          alt={study.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `linear-gradient(180deg, transparent 45%, ${hexToRgba(accent, 0.3)} 100%)`,
          }}
        />
        <span className="absolute left-1.5 top-1.5 rounded-full bg-black/45 px-1.5 py-0.5 font-mono text-[8px] font-medium text-white backdrop-blur-sm">
          {String(index).padStart(2, "0")}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center py-1">
        <p
          className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em]"
          style={{ color: accent }}
        >
          {study.categoryLabel}
        </p>
        <h3 className="mb-0.5 truncate font-serif text-base font-semibold leading-snug text-foreground">
          {study.title}
        </h3>
        <p className="mb-1.5 truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
          {study.client}
        </p>
        <span className="flex w-fit items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          View
          <svg
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="h-2.5 w-2.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          >
            <path
              d="M3 13L13 3M13 3H5M13 3v8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}
