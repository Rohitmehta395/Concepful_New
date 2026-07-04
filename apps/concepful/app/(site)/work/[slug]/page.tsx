import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Wrench, ArrowUpRight } from "lucide-react";
import { CASE_STUDIES } from "@/data/case-studies";
import { AnimatedHeroCard } from "@/components/features/work/animated-hero-card";
import { AnimatedMetricCard } from "@/components/features/work/animated-metric-card";

export function generateStaticParams() {
  return CASE_STUDIES.map((cs) => ({
    slug: cs.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cs = CASE_STUDIES.find(c => c.slug === slug);
  if (!cs) return { title: "Not Found" };
  return {
    title: `${cs.title} | Concepful`,
    description: cs.teaser,
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cs = CASE_STUDIES.find(c => c.slug === slug);
  
  if (!cs) {
    notFound();
  }
  
  const currentIdx = CASE_STUDIES.findIndex(c => c.slug === slug);
  const next = CASE_STUDIES[(currentIdx + 1) % CASE_STUDIES.length];

  return (
    <>
      {/* Back nav */}
      <div className="container mx-auto max-w-3xl px-6 pt-8">
        <Link
          href="/work"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> All work
        </Link>
      </div>

      {/* Hero */}
      <section className="px-6 pt-10 pb-16">
        <div className="container mx-auto max-w-3xl">
          {/* Category pill */}
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border mb-6"
            style={{
              color: cs.accentColor,
              borderColor: `${cs.accentColor}40`,
              backgroundColor: `${cs.accentColor}12`,
            }}
          >
            {cs.categoryLabel}
          </span>

          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight leading-[1.08] mb-4">
            {cs.title}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-2xl">
            {cs.teaser}
          </p>
          <p className="text-sm font-semibold text-foreground/60 uppercase tracking-widest">
            {cs.client}
          </p>
        </div>
      </section>

      {/* Hero gradient card */}
      <section className="px-6 mb-16">
        <div className="container mx-auto max-w-3xl">
          <AnimatedHeroCard
            gradient={cs.gradient}
            accentColor={cs.accentColor}
            tags={cs.tags}
          />
        </div>
      </section>

      {/* Outcome metrics — above the fold, SEO-rich */}
      <section className="px-6 mb-16">
        <div className="container mx-auto max-w-3xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cs.outcomeMetrics.map((m, i) => (
              <AnimatedMetricCard
                key={m.label}
                label={m.label}
                value={m.value}
                accentColor={cs.accentColor}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Body content */}
      <section className="px-6 pb-20">
        <div className="container mx-auto max-w-3xl space-y-16">

          {/* The brief */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground mb-4">The Brief</p>
            <p className="text-lg leading-relaxed text-foreground/85">{cs.brief}</p>
          </div>

          {/* Divider */}
          <hr className="border-border/40" />

          {/* Challenges */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground mb-6">The Challenges</p>
            <ul className="space-y-5">
              {cs.challenges.map((c, i) => (
                <li key={i} className="flex gap-4">
                  <span
                    className="mt-1 h-5 w-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ backgroundColor: `${cs.accentColor}20`, color: cs.accentColor }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-base leading-relaxed text-foreground/80">{c}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Divider */}
          <hr className="border-border/40" />

          {/* What we made */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground mb-6">What We Made</p>
            <ul className="space-y-3">
              {cs.deliverables.map((d, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: cs.accentColor }} />
                  <span className="text-sm leading-relaxed">{d}</span>
                </li>
              ))}
            </ul>

            {/* Tools */}
            <div className="mt-8 flex items-center gap-3 flex-wrap">
              <Wrench className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {cs.tools.map(t => (
                <span
                  key={t}
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border/50"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Divider */}
          <hr className="border-border/40" />

          {/* Outcome */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground mb-4">The Outcome</p>
            <p className="text-lg leading-relaxed text-foreground/85">{cs.outcome}</p>
          </div>

        </div>
      </section>

      {/* Next project */}
      <section className="border-t border-border/40 px-6 py-10">
        <div className="container mx-auto max-w-3xl flex items-center justify-between gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Next project</p>
            <Link
              href={`/work/${next.slug}`}
              className="font-serif text-xl font-bold hover:text-primary transition-colors flex items-center gap-2 group w-fit"
            >
              {next.title}
              <ArrowRight className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>
            <p className="text-sm text-muted-foreground mt-0.5">{next.client} · {next.categoryLabel}</p>
          </div>

          <Link
            href="/"
            className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold border border-primary/30 text-primary px-4 py-2 rounded-xl hover:bg-primary/5 transition-colors"
          >
            See plans <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </>
  );
}
