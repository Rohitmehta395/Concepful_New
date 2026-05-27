import { Router } from "express";
import { db } from "@workspace/db";
import { brandProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/brand/:companyId", async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    const [profile] = await db.select().from(brandProfilesTable)
      .where(eq(brandProfilesTable.companyId, companyId));
    if (!profile) return res.status(404).json({ error: "Not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Failed to get brand profile" });
  }
});

router.put("/brand/:companyId", async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    const existing = await db.select().from(brandProfilesTable)
      .where(eq(brandProfilesTable.companyId, companyId));

    if (existing.length > 0) {
      const [updated] = await db.update(brandProfilesTable)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(brandProfilesTable.companyId, companyId))
        .returning();
      return res.json(updated);
    }

    const [created] = await db.insert(brandProfilesTable)
      .values({ companyId, ...req.body })
      .returning();
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: "Failed to upsert brand profile" });
  }
});

export default router;
