import { WorkHero } from "@/components/features/work/work-hero";
import { WorkFeatured } from "@/components/features/work/work-featured";
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

  return (
    <div className="flex-1 overflow-x-clip">
      <WorkHero caseStudies={featuredCaseStudies} />
      <WorkFeatured caseStudies={featuredCaseStudies} />
      <WorkMosaic caseStudies={allCaseStudies} categories={categories} />
      <WorkCTA />
    </div>
  );
}
