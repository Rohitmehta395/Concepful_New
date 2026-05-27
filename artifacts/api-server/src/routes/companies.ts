import { Router } from "express";
import { db } from "@workspace/db";
import { companiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/companies", async (_req, res) => {
  try {
    const companies = await db.select().from(companiesTable).orderBy(companiesTable.createdAt);
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: "Failed to list companies" });
  }
});

router.get("/companies/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, id));
    if (!company) return res.status(404).json({ error: "Not found" });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: "Failed to get company" });
  }
});

router.patch("/companies/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(companiesTable)
      .set(req.body)
      .where(eq(companiesTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update company" });
  }
});

export default router;
