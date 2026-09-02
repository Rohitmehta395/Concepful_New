import { WorkHero } from "@/components/features/work/work-hero";
import { WorkMosaic } from "@/components/features/work/work-mosaic";
import { WorkCTA } from "@/components/features/work/work-cta";
import {
  getAllCaseStudies,
  getFeaturedCaseStudies,
} from "@/lib/content/work";
import { getCategories } from "@/lib/content/categories";

export const metadata = {
  title: "Work | Concepful",
  description: "What we build for our clients.",
};

export default async function WorkPage() {
  const [featuredCaseStudies, allCaseStudies, categories] = await Promise.all([
    getFeaturedCaseStudies(),
    getAllCaseStudies(),
    getCategories(),
  ]);

  // If there are no featured case studies, fall back to the top 3 case studies
  const heroCaseStudies =
    featuredCaseStudies.length > 0
      ? featuredCaseStudies
      : allCaseStudies.slice(0, 3);

  return (
    <div className="flex-1 overflow-x-clip">
      <WorkHero
        caseStudies={heroCaseStudies}
        fallbackCaseStudies={allCaseStudies}
      />
      <WorkMosaic caseStudies={allCaseStudies} categories={categories} />
      <WorkCTA />
    </div>
  );
}
