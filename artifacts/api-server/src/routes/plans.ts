import { Router } from "express";
import { db } from "@workspace/db";
import { planSelectionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/plans", async (_req, res) => {
  try {
    const plans = await db.select().from(planSelectionsTable).orderBy(planSelectionsTable.createdAt);
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: "Failed to list plans" });
  }
});

router.post("/plans", async (req, res) => {
  try {
    const [plan] = await db.insert(planSelectionsTable).values(req.body).returning();
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ error: "Failed to create plan" });
  }
});

router.get("/plans/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [plan] = await db.select().from(planSelectionsTable).where(eq(planSelectionsTable.id, id));
    if (!plan) return res.status(404).json({ error: "Not found" });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: "Failed to get plan" });
  }
});

router.patch("/plans/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(planSelectionsTable)
      .set(req.body)
      .where(eq(planSelectionsTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update plan" });
  }
});

export default router;
