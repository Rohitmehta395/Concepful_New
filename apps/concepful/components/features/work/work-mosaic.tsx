"use client";

import { useState } from "react";
import { getAllCaseStudies, getCategoryFilters } from "@/data/work-data";
import { WorkFilters } from "./work-filters";
import { WorkGrid } from "./work-grid";

export function WorkMosaic() {
  const [activeFilter, setActiveFilter] = useState("all");
  const caseStudies = getAllCaseStudies();
  const categoryFilters = getCategoryFilters();

  const filtered = caseStudies.filter(
    cs => activeFilter === "all" || cs.category === activeFilter
  );

  return (
    <>
      <WorkFilters
        filters={categoryFilters}
        caseStudies={caseStudies}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        filteredCount={filtered.length}
      />
      <WorkGrid caseStudies={filtered} />
    </>
  );
}
