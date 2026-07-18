import { CASE_STUDIES, CATEGORY_FILTERS, CaseStudy } from "./case-studies";

export function getAllCaseStudies(): CaseStudy[] {
  return CASE_STUDIES;
}

export function getFeaturedCaseStudies(): CaseStudy[] {
  return CASE_STUDIES.filter((study) => study.featured).slice(0, 3);
}

export function getCategoryFilters() {
  return CATEGORY_FILTERS;
}
