import { Router } from "express";
import { db } from "@workspace/db";
import { blogPostsTable, insertBlogPostSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/admin/blog", async (_req, res) => {
  try {
    const posts = await db
      .select()
      .from(blogPostsTable)
      .orderBy(desc(blogPostsTable.createdAt));
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list blog posts" });
  }
});

router.get("/admin/blog/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id));
    if (!post) return res.status(404).json({ error: "Not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to get blog post" });
  }
});

router.post("/admin/blog", async (req, res) => {
  try {
    const parsed = insertBlogPostSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const data = { ...parsed.data };
    if (data.status === "published" && !data.publishedAt) {
      (data as any).publishedAt = new Date();
    }
    const [post] = await db.insert(blogPostsTable).values(data).returning();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create blog post" });
  }
});

router.patch("/admin/blog/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates: Record<string, any> = { ...req.body, updatedAt: new Date() };
    if (updates.status === "published" && !updates.publishedAt) {
      updates.publishedAt = new Date();
    }
    const [post] = await db
      .update(blogPostsTable)
      .set(updates)
      .where(eq(blogPostsTable.id, id))
      .returning();
    if (!post) return res.status(404).json({ error: "Not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to update blog post" });
  }
});

router.delete("/admin/blog/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id));
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete blog post" });
  }
});

export default router;
