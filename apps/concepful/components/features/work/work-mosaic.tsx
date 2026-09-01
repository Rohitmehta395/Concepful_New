"use client";

import { useState, useEffect, useCallback } from "react";
import type { CaseStudy, Category } from "@/lib/content/types";
import { WorkFilters } from "./work-filters";
import { WorkGrid } from "./work-grid";

export interface WorkMosaicProps {
  caseStudies: CaseStudy[];
  categories: Category[];
}

export function WorkMosaic({ caseStudies, categories }: WorkMosaicProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filterOptions = [
    { id: "all", label: "All Work" },
    ...categories.map((c) => ({ id: c.slug, label: c.name })),
  ];

  const handleExternalFilter = useCallback(
    (tag: string) => {
      const normalized = tag.toLowerCase().trim();
      const slugified = normalized.replace(/[^a-z0-9]+/g, "-");

      const match = filterOptions.find((f) => {
        if (f.id === "all") return false;
        const fLabel = f.label.toLowerCase();
        const fId = f.id.toLowerCase();

        return (
          fId === slugified ||
          fLabel === normalized ||
          fId.includes(slugified) ||
          slugified.includes(fId) ||
          fLabel.includes(normalized) ||
          normalized.includes(fLabel)
        );
      });

      if (match) {
        setActiveFilter(match.id);
      }
    },
    [filterOptions]
  );

  useEffect(() => {
    const onFilterEvent = (e: CustomEvent<string>) => {
      if (e.detail) {
        handleExternalFilter(e.detail);
      }
    };

    window.addEventListener(
      "concepful:filter-work" as any,
      onFilterEvent as EventListener
    );

    return () => {
      window.removeEventListener(
        "concepful:filter-work" as any,
        onFilterEvent as EventListener
      );
    };
  }, [handleExternalFilter]);

  const filtered = caseStudies.filter(
    (cs) => activeFilter === "all" || cs.category?.slug === activeFilter
  );

  return (
    <div id="all-work" className="scroll-mt-16">
      <WorkFilters
        filters={filterOptions}
        caseStudies={caseStudies}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        filteredCount={filtered.length}
      />
      <WorkGrid caseStudies={filtered} />
    </div>
  );
}
