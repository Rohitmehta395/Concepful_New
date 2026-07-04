import { NextRequest, NextResponse } from "next/server";
import { db } from "@workspace/db";
import { companiesTable, onboardingSubmissionsTable, planSelectionsTable, brandProfilesTable, aiModelProfilesTable } from "@workspace/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, contact, plan, goals, brand, aiSetup } = body;

    const [newCompany] = await db.insert(companiesTable).values({
      name: company.name,
      website: company.website,
      industry: company.industry,
      size: company.size,
      revenueRange: company.revenueRange,
    }).returning();

    const [submission] = await db.insert(onboardingSubmissionsTable).values({
      companyId: newCompany.id,
      companyName: company.name,
      contactName: contact?.name,
      contactEmail: contact?.email,
      contactPhone: contact?.phone,
      tier: plan.tier,
      billingCycle: plan.billingCycle,
      addOns: plan.addOns ?? [],
      aiOpsLevel: plan.aiOpsLevel ?? "none",
      estimatedMonthlyTotal: plan.estimatedMonthlyTotal,
      estimatedAnnualTotal: plan.estimatedAnnualTotal,
      goals: goals ?? {},
      brandInputs: brand ?? {},
      aiSetup: aiSetup ?? {},
      status: "pending",
    }).returning();

    await db.insert(planSelectionsTable).values({
      companyId: newCompany.id,
      tier: plan.tier,
      billingCycle: plan.billingCycle,
      basePrice: plan.estimatedMonthlyTotal ?? 0,
      discount: 0,
      addOns: plan.addOns ?? [],
      aiOpsLevel: plan.aiOpsLevel ?? "none",
      estimatedMonthlyTotal: plan.estimatedMonthlyTotal,
      estimatedAnnualTotal: plan.estimatedAnnualTotal,
    });

    if (brand) {
      await db.insert(brandProfilesTable).values({
        companyId: newCompany.id,
        colors: brand.colors ?? [],
        fonts: brand.fonts ?? [],
        toneWords: brand.toneWords ?? [],
        visualReferences: [],
        approvedAssets: [],
        bannedWords: [],
        requiredDisclaimers: [],
      });
    }

    if (aiSetup) {
      await db.insert(aiModelProfilesTable).values({
        companyId: newCompany.id,
        providers: aiSetup.providers ?? [],
        useCases: [],
        consentAiWorkflows: aiSetup.consentAiWorkflows ?? false,
        consentBrandMemory: aiSetup.consentBrandMemory ?? false,
      });
    }

    return NextResponse.json({
      id: submission.id,
      companyId: newCompany.id,
      message: "Onboarding submitted successfully",
    }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to submit onboarding" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const submissions = await db.select().from(onboardingSubmissionsTable).orderBy(onboardingSubmissionsTable.createdAt);
    return NextResponse.json(submissions);
  } catch (err) {
    return NextResponse.json({ error: "Failed to list onboardings" }, { status: 500 });
  }
}
