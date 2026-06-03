import { db, companiesTable, onboardingSubmissionsTable, planSelectionsTable, brandProfilesTable, aiModelProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding Testies Inc. test account...");

  const existing = await db.select().from(companiesTable).where(eq(companiesTable.name, "Testies Inc."));
  if (existing.length > 0) {
    console.log("Testies Inc. already exists (id:", existing[0].id, "). Skipping.");
    process.exit(0);
  }

  const [company] = await db.insert(companiesTable).values({
    name: "Testies Inc.",
    website: "https://testies.dev",
    industry: "Technology",
    size: "11-50",
    revenueRange: "$1M-$10M",
  }).returning();

  console.log("Created company:", company.id);

  await db.insert(onboardingSubmissionsTable).values({
    companyId: company.id,
    companyName: "Testies Inc.",
    contactName: "Testies User",
    contactEmail: "hello@testies.dev",
    tier: "pulse",
    billingCycle: "monthly",
    addOns: [],
    aiOpsLevel: "none",
    estimatedMonthlyTotal: 3500,
    estimatedAnnualTotal: 37800,
    goals: {
      improvements: ["Brand consistency", "Faster content output"],
      painPoints: "Design bandwidth is a bottleneck across every campaign.",
      firstPriorities: ["Brand guidelines", "Social media content"],
    },
    brandInputs: {
      colors: ["#E8193C", "#0E1228"],
      fonts: ["Poppins", "Inter"],
      toneWords: ["Bold", "modern", "trustworthy"],
    },
    aiSetup: { providers: [], consentBrandMemory: false, consentAiWorkflows: false },
    status: "pending",
  });

  await db.insert(planSelectionsTable).values({
    companyId: company.id,
    tier: "pulse",
    billingCycle: "monthly",
    basePrice: 3500,
    discount: 0,
    addOns: [],
    aiOpsLevel: "none",
    estimatedMonthlyTotal: 3500,
    estimatedAnnualTotal: 37800,
  });

  await db.insert(brandProfilesTable).values({
    companyId: company.id,
    colors: ["#E8193C", "#0E1228"],
    fonts: ["Poppins", "Inter"],
    toneWords: ["Bold", "modern", "trustworthy"],
  });

  await db.insert(aiModelProfilesTable).values({
    companyId: company.id,
    providers: [],
    consentBrandMemory: false,
    consentAiWorkflows: false,
  });

  console.log("✅ Testies Inc. seeded successfully (company id:", company.id, ")");
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
