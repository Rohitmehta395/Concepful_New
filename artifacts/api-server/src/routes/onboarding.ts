import { Router } from "express";
import { db } from "@workspace/db";
import { companiesTable, onboardingSubmissionsTable, planSelectionsTable, brandProfilesTable, aiModelProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/onboarding", async (req, res) => {
  try {
    const body = req.body;
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

    res.status(201).json({
      id: submission.id,
      companyId: newCompany.id,
      message: "Onboarding submitted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit onboarding" });
  }
});

router.get("/onboarding", async (_req, res) => {
  try {
    const submissions = await db.select().from(onboardingSubmissionsTable).orderBy(onboardingSubmissionsTable.createdAt);
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: "Failed to list onboardings" });
  }
});

router.get("/onboarding/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [submission] = await db.select().from(onboardingSubmissionsTable).where(eq(onboardingSubmissionsTable.id, id));
    if (!submission) return res.status(404).json({ error: "Not found" });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: "Failed to get onboarding" });
  }
});

export default router;
