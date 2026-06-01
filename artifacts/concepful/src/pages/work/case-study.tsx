import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/layout/site-layout";
import { CASE_STUDIES } from "@/data/case-studies";
import { useAuthState } from "@/hooks/use-auth-state";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, CheckCircle2, Wrench, ArrowUpRight, Share2, Sparkles } from "lucide-react";

export default function CaseStudy() {
  const [, params] = useRoute("/work/:slug");
  const [, setLocation] = useLocation();
  const { role, session } = useAuthState();
  const slug = params?.slug;

  const cs = CASE_STUDIES.find(c => c.slug === slug);
  const currentIdx = CASE_STUDIES.findIndex(c => c.slug === slug);
  const next = CASE_STUDIES[(currentIdx + 1) % CASE_STUDIES.length];

  if (!cs) {
    return (
      <SiteLayout>
        <div className="container mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="font-serif text-3xl font-bold mb-4">Case study not found</h1>
          <button onClick={() => setLocation("/work")} className="text-primary hover:underline">← Back to work</button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      {/* Back nav */}
      <div className="container mx-auto max-w-3xl px-6 pt-8">
        <button
          onClick={() => setLocation("/work")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> All work
        </button>
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
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(
              "relative h-52 md:h-72 rounded-3xl overflow-hidden bg-gradient-to-br",
              cs.gradient
            )}
          >
            {/* Decorative circles */}
            <div className="absolute top-8 right-12 h-32 w-32 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: cs.accentColor }} />
            <div className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full opacity-10" style={{ backgroundColor: cs.accentColor }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full opacity-10 border-2" style={{ borderColor: cs.accentColor }} />

            {/* Tags */}
            <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
              {cs.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/30 text-white/80 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Outcome metrics — above the fold, SEO-rich */}
      <section className="px-6 mb-16">
        <div className="container mx-auto max-w-3xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cs.outcomeMetrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.3 }}
                className="rounded-2xl border border-border/60 bg-card p-4"
              >
                <p
                  className="text-2xl font-bold leading-none mb-2 font-serif"
                  style={{ color: cs.accentColor }}
                >
                  {m.value}
                </p>
                <p className="text-xs text-muted-foreground leading-snug">{m.label}</p>
              </motion.div>
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
            <button
              onClick={() => setLocation(`/work/${next.slug}`)}
              className="font-serif text-xl font-bold hover:text-primary transition-colors flex items-center gap-2 group"
            >
              {next.title}
              <ArrowRight className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>
            <p className="text-sm text-muted-foreground mt-0.5">{next.client} · {next.categoryLabel}</p>
          </div>

          {(role === "client" || role === "admin") ? (
            <a
              href="mailto:hello@concepful.com?subject=Feature my project"
              className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold border border-primary/30 text-primary px-4 py-2 rounded-xl hover:bg-primary/5 transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" /> Submit yours
            </a>
          ) : role === "prospect-hot" ? (
            <a
              href="/checkout"
              className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Complete setup <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          ) : (
            <a
              href="/"
              className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold border border-primary/30 text-primary px-4 py-2 rounded-xl hover:bg-primary/5 transition-colors"
            >
              See plans <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
