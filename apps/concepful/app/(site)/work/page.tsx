import { WorkHero } from "@/components/features/work/work-hero";
import { WorkMosaic } from "@/components/features/work/work-mosaic";
import { WorkCTA } from "@/components/features/work/work-cta";

export const metadata = {
  title: "Work | Concepful",
  description: "What we build for our clients.",
};

export default function WorkPage() {
  return (
    <div className="flex-1 pb-32">
      <WorkHero />
      <WorkMosaic />
      <WorkCTA />
    </div>
  );
}
