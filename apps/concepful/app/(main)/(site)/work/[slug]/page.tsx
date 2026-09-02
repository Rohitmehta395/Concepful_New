import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllCaseStudies,
  getCaseStudyBySlug,
  getAdjacentCaseStudy,
} from "@/lib/content/work";
import { CaseStudyHero } from "@/components/features/work/case-study-hero";
import { CaseStudyShowcase } from "@/components/features/work/case-study-showcase";
import { CaseStudyMetrics } from "@/components/features/work/case-study-metrics";
import { CaseStudyTOC } from "@/components/features/work/case-study-toc";
import { CaseStudyContent } from "@/components/features/work/case-study-content";
import { CaseStudyNext } from "@/components/features/work/case-study-next";
import { WorkCTA } from "@/components/features/work/work-cta";

export async function generateStaticParams() {
  try {
    const caseStudies = await getAllCaseStudies();
    return caseStudies.map((cs) => ({
      slug: cs.slug,
    }));
  } catch (error) {
    console.warn(
      "[generateStaticParams] Could not fetch case studies during build:",
      error,
    );
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cs = await getCaseStudyBySlug(slug);
  if (!cs) return { title: "Case Study Not Found | Concepful" };

  return {
    title: `${cs.title} — Case Study | Concepful`,
    description: cs.teaser,
    openGraph: {
      title: `${cs.title} | Concepful`,
      description: cs.teaser,
      images: cs.coverImage?.url ? [{ url: cs.coverImage.url, alt: cs.coverImage.alt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${cs.title} | Concepful`,
      description: cs.teaser,
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cs = await getCaseStudyBySlug(slug);

  if (!cs) {
    notFound();
  }

  const next = await getAdjacentCaseStudy(cs);

  return (
    <article className="flex-1 overflow-x-clip">
      {/* 1. Hero with Breadcrumb, Title, Teaser & Project Specs */}
      <CaseStudyHero study={cs} />

      {/* 2. Visual Showcase Media Artwork Container */}
      <CaseStudyShowcase study={cs} />

      {/* 3. Bento Key Impact & Outcome Metrics Grid */}
      <CaseStudyMetrics metrics={cs.outcomeMetrics} />

      {/* 4. Editorial Deep-Dive Story Grid with Sticky Sidebar */}
      <section className="px-6 pb-20 md:pb-28">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <CaseStudyTOC />
            <CaseStudyContent study={cs} />
          </div>
        </div>
      </section>

      {/* 5. Next Project Navigation Banner */}
      <CaseStudyNext nextStudy={next} />

      {/* 6. High-Converting Agency CTA */}
      <WorkCTA />
    </article>
  );
}
