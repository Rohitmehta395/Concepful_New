import { db, companiesTable, workRequestsTable, completedWorkTable, brandProfilesTable, aiModelProfilesTable } from "./index";

async function seed() {
  console.log("Seeding database...");

  try {
    // 1. Create a dummy company
    const [company] = await db.insert(companiesTable).values({
      name: "Acme Corp",
      website: "https://acme.com",
      industry: "Technology",
      size: "10-50",
      revenueRange: "$1M - $5M",
    }).returning();

    console.log(`Created company: ${company.name} (ID: ${company.id})`);

    // 2. Create brand profile
    await db.insert(brandProfilesTable).values({
      companyId: company.id,
      colors: ["#FF0000", "#00FF00", "#0000FF"],
      fonts: ["Inter", "Roboto"],
      toneWords: ["Professional", "Friendly", "Innovative"],
    });

    // 3. Create AI Model profile
    await db.insert(aiModelProfilesTable).values({
      companyId: company.id,
      providers: ["OpenAI", "Anthropic"],
      modelName: "GPT-4",
      consentAiWorkflows: true,
      consentBrandMemory: true,
    });

    // 4. Create Work Requests
    await db.insert(workRequestsTable).values([
      {
        companyId: company.id,
        title: "Q3 Marketing Campaign Assets",
        type: "Design",
        priority: "high",
        status: "in_progress",
        description: "Need banners and social media assets for the Q3 campaign.",
      },
      {
        companyId: company.id,
        title: "Website Redesign Concepts",
        type: "Web Design",
        priority: "medium",
        status: "pending",
        description: "Initial concepts for the new homepage.",
      },
    ]);

    // 5. Create Completed Work
    await db.insert(completedWorkTable).values([
      {
        companyId: company.id,
        title: "Logo Refresh",
        category: "Branding",
        notes: "Updated the logo to be more modern.",
        approved: true,
      }
    ]);

    console.log("Seeding complete! You can now log in with Company ID: 1");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
