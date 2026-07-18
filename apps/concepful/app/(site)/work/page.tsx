import { WorkHero } from "@/components/features/work/work-hero";
import { WorkFeatured } from "@/components/features/work/work-featured";
import { WorkMosaic } from "@/components/features/work/work-mosaic";
import { WorkCTA } from "@/components/features/work/work-cta";
import { getFeaturedCaseStudies } from "@/data/work-data";

export const metadata = {
  title: "Work | Concepful",
  description: "What we build for our clients.",
};

export default function WorkPage() {
  const featuredCaseStudies = getFeaturedCaseStudies();

  return (
    <div className="flex-1 overflow-x-clip">
      <WorkHero caseStudies={featuredCaseStudies} />
      <WorkFeatured caseStudies={featuredCaseStudies} />
      <WorkMosaic />
      <WorkCTA />
    </div>
  );
}
