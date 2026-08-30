"use client";

import { useState } from "react";
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

  const filtered = caseStudies.filter(
    (cs) => activeFilter === "all" || cs.category?.slug === activeFilter
  );

  return (
    <>
      <WorkFilters
        filters={filterOptions}
        caseStudies={caseStudies}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        filteredCount={filtered.length}
      />
      <WorkGrid caseStudies={filtered} />
    </>
  );
}
