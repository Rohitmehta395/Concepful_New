import { Router } from "express";
import { db } from "@workspace/db";
import { aiModelProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/ai-profiles/:companyId", async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    const [profile] = await db.select().from(aiModelProfilesTable)
      .where(eq(aiModelProfilesTable.companyId, companyId));
    if (!profile) return res.status(404).json({ error: "Not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Failed to get AI profile" });
  }
});

router.put("/ai-profiles/:companyId", async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    const existing = await db.select().from(aiModelProfilesTable)
      .where(eq(aiModelProfilesTable.companyId, companyId));

    if (existing.length > 0) {
      const [updated] = await db.update(aiModelProfilesTable)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(aiModelProfilesTable.companyId, companyId))
        .returning();
      return res.json(updated);
    }

    const [created] = await db.insert(aiModelProfilesTable)
      .values({ companyId, ...req.body })
      .returning();
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: "Failed to upsert AI profile" });
  }
});

export default router;
