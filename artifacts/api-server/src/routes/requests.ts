import { Router } from "express";
import { db } from "@workspace/db";
import { workRequestsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/requests", async (req, res) => {
  try {
    const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : null;
    const status = req.query.status as string | undefined;

    let query = db.select().from(workRequestsTable);

    if (companyId && status) {
      const results = await db.select().from(workRequestsTable)
        .where(and(eq(workRequestsTable.companyId, companyId), eq(workRequestsTable.status, status)))
        .orderBy(workRequestsTable.createdAt);
      return res.json(results);
    } else if (companyId) {
      const results = await db.select().from(workRequestsTable)
        .where(eq(workRequestsTable.companyId, companyId))
        .orderBy(workRequestsTable.createdAt);
      return res.json(results);
    } else if (status) {
      const results = await db.select().from(workRequestsTable)
        .where(eq(workRequestsTable.status, status))
        .orderBy(workRequestsTable.createdAt);
      return res.json(results);
    }

    const results = await db.select().from(workRequestsTable).orderBy(workRequestsTable.createdAt);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to list requests" });
  }
});

router.post("/requests", async (req, res) => {
  try {
    const [request] = await db.insert(workRequestsTable).values(req.body).returning();
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: "Failed to create request" });
  }
});

router.get("/requests/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [request] = await db.select().from(workRequestsTable).where(eq(workRequestsTable.id, id));
    if (!request) return res.status(404).json({ error: "Not found" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: "Failed to get request" });
  }
});

router.patch("/requests/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(workRequestsTable)
      .set(req.body)
      .where(eq(workRequestsTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update request" });
  }
});

export default router;
