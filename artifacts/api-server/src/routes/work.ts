import { Router } from "express";
import { db } from "@workspace/db";
import { completedWorkTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/work", async (req, res) => {
  try {
    const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : null;
    if (companyId) {
      const results = await db.select().from(completedWorkTable)
        .where(eq(completedWorkTable.companyId, companyId))
        .orderBy(completedWorkTable.completedAt);
      return res.json(results);
    }
    const results = await db.select().from(completedWorkTable).orderBy(completedWorkTable.completedAt);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to list completed work" });
  }
});

router.post("/work", async (req, res) => {
  try {
    const [work] = await db.insert(completedWorkTable).values(req.body).returning();
    res.status(201).json(work);
  } catch (err) {
    res.status(500).json({ error: "Failed to create completed work" });
  }
});

router.patch("/work/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(completedWorkTable)
      .set(req.body)
      .where(eq(completedWorkTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update completed work" });
  }
});

export default router;
