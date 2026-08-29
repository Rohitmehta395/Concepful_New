"use client";

import { useState } from "react";
import type { CaseStudy } from "@/data/case-studies";
import { WorkFilters } from "./work-filters";
import { WorkGrid } from "./work-grid";

export interface WorkMosaicProps {
  caseStudies: CaseStudy[];
  categories: { id: string; label: string }[];
}

export function WorkMosaic({ caseStudies, categories }: WorkMosaicProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = caseStudies.filter(
    (cs) => activeFilter === "all" || cs.category === activeFilter
  );

  return (
    <>
      <WorkFilters
        filters={categories}
        caseStudies={caseStudies}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        filteredCount={filtered.length}
      />
      <WorkGrid caseStudies={filtered} />
    </>
  );
}
