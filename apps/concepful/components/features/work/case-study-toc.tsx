"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Handshake } from "lucide-react";

interface TOCItem {
  id: string;
  label: string;
}

const SECTIONS: TOCItem[] = [
  { id: "the-brief", label: "The Brief" },
  { id: "challenges", label: "The Challenges" },
  { id: "what-we-made", label: "What We Made" },
  { id: "the-outcome", label: "The Outcome" },
];

export function CaseStudyTOC() {
  const [activeId, setActiveId] = useState<string>("the-brief");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <aside className="hidden lg:block lg:col-span-4 sticky top-24 self-start space-y-6">
      {/* Table of Contents card */}
      <div className="p-5 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm shadow-2xs">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Case Study Contents
        </p>

        <nav className="space-y-1">
          {SECTIONS.map((section) => {
            const isActive = activeId === section.id;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(e) => scrollToSection(e, section.id)}
                className={`flex items-center text-xs font-medium py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <span>{section.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Mini Conversion Card */}
      <div className="p-5 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm space-y-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
          <Handshake className="h-3 w-3" />
          Partner with us
        </div>

        <div>
          <h4 className="font-serif text-base font-bold text-foreground">
            Need similar outcomes?
          </h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Get an experienced, dedicated design and strategy partner without full-time agency overhead.
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <Link
            href="/contact"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
          >
            <span>Book Discovery Call</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/pricing"
            className="flex items-center justify-center w-full py-2 px-4 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors text-center"
          >
            Explore Plans & Pricing
          </Link>
        </div>
      </div>
    </aside>
  );
}
