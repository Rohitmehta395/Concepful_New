import { Router } from "express";
import { db } from "@workspace/db";
import {
  companiesTable, onboardingSubmissionsTable, workRequestsTable, planSelectionsTable,
  crmContactsTable, blogPostsTable, portfolioItemsTable,
} from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";

const router = Router();

router.get("/admin/stats", async (_req, res) => {
  try {
    const [{ totalLeads }] = await db.select({ totalLeads: count() }).from(onboardingSubmissionsTable);
    const [{ activeClients }] = await db.select({ activeClients: count() }).from(companiesTable);
    const [{ openRequests }] = await db.select({ openRequests: count() }).from(workRequestsTable)
      .where(sql`status NOT IN ('completed', 'delivered')`);

    const planRows = await db.select().from(planSelectionsTable);
    const totalMrr = planRows.reduce((sum, p) => sum + (p.estimatedMonthlyTotal ?? p.basePrice ?? 0), 0);

    const signalClients = planRows.filter(p => p.tier === "signal").length;
    const pulseClients = planRows.filter(p => p.tier === "pulse").length;
    const cortexClients = planRows.filter(p => p.tier === "cortex").length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [{ completedWorkThisMonth }] = await db.select({ completedWorkThisMonth: count() }).from(workRequestsTable)
      .where(sql`status = 'completed' AND created_at >= ${startOfMonth.toISOString()}`);

    const recentOnboardings = await db.select().from(onboardingSubmissionsTable)
      .orderBy(onboardingSubmissionsTable.createdAt)
      .limit(10);

    // CRM / content metrics
    const [{ totalContacts }] = await db.select({ totalContacts: count() }).from(crmContactsTable);
    const [{ activeProspects }] = await db.select({ activeProspects: count() }).from(crmContactsTable)
      .where(sql`stage NOT IN ('won', 'lost')`);
    const [{ publishedPosts }] = await db.select({ publishedPosts: count() }).from(blogPostsTable)
      .where(eq(blogPostsTable.status, "published"));
    const [{ publishedPortfolio }] = await db.select({ publishedPortfolio: count() }).from(portfolioItemsTable)
      .where(eq(portfolioItemsTable.status, "published"));

    res.json({
      totalLeads,
      activeClients,
      totalMrr,
      openRequests,
      signalClients,
      pulseClients,
      cortexClients,
      completedWorkThisMonth,
      recentOnboardings,
      totalContacts,
      activeProspects,
      publishedPosts,
      publishedPortfolio,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get admin stats" });
  }
});

router.get("/admin/mrr", async (_req, res) => {
  try {
    const plans = await db.select().from(planSelectionsTable);

    const tiers = ["signal", "pulse", "cortex"];
    const byTier = tiers.map(tier => {
      const tierPlans = plans.filter(p => p.tier === tier);
      return {
        tier,
        clients: tierPlans.length,
        mrr: tierPlans.reduce((sum, p) => sum + (p.estimatedMonthlyTotal ?? p.basePrice ?? 0), 0),
      };
    });

    const total = byTier.reduce((sum, t) => sum + t.mrr, 0);
    res.json({ total, byTier });
  } catch (err) {
    res.status(500).json({ error: "Failed to get MRR data" });
  }
});

export default router;
