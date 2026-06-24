import { Router } from "express";
import { db } from "@workspace/db";
import { portfolioItemsTable, insertPortfolioItemSchema } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/admin/portfolio", async (_req, res) => {
  try {
    const items = await db
      .select()
      .from(portfolioItemsTable)
      .orderBy(asc(portfolioItemsTable.sortOrder), asc(portfolioItemsTable.createdAt));
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list portfolio items" });
  }
});

router.get("/admin/portfolio/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [item] = await db.select().from(portfolioItemsTable).where(eq(portfolioItemsTable.id, id));
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to get portfolio item" });
  }
});

router.post("/admin/portfolio", async (req, res) => {
  try {
    const parsed = insertPortfolioItemSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const [item] = await db.insert(portfolioItemsTable).values(parsed.data).returning();
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create portfolio item" });
  }
});

router.patch("/admin/portfolio/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [item] = await db
      .update(portfolioItemsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(portfolioItemsTable.id, id))
      .returning();
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to update portfolio item" });
  }
});

router.delete("/admin/portfolio/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(portfolioItemsTable).where(eq(portfolioItemsTable.id, id));
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete portfolio item" });
  }
});

export default router;
