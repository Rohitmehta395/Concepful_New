import { Router } from "express";
import { db } from "@workspace/db";
import { crmContactsTable, insertCrmContactSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/admin/crm", async (_req, res) => {
  try {
    const contacts = await db
      .select()
      .from(crmContactsTable)
      .orderBy(desc(crmContactsTable.createdAt));
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list CRM contacts" });
  }
});

router.get("/admin/crm/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [contact] = await db.select().from(crmContactsTable).where(eq(crmContactsTable.id, id));
    if (!contact) return res.status(404).json({ error: "Not found" });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: "Failed to get contact" });
  }
});

router.post("/admin/crm", async (req, res) => {
  try {
    const parsed = insertCrmContactSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const [contact] = await db.insert(crmContactsTable).values(parsed.data).returning();
    res.status(201).json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create contact" });
  }
});

router.patch("/admin/crm/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [contact] = await db
      .update(crmContactsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(crmContactsTable.id, id))
      .returning();
    if (!contact) return res.status(404).json({ error: "Not found" });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: "Failed to update contact" });
  }
});

router.delete("/admin/crm/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(crmContactsTable).where(eq(crmContactsTable.id, id));
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

export default router;
