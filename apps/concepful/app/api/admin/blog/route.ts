import { NextRequest, NextResponse } from "next/server";
import { db } from "@workspace/db";
import { blogPostsTable, insertBlogPostSchema } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const authErr = requireAdmin(request);
  if (authErr) return authErr;

  try {
    const posts = await db
      .select()
      .from(blogPostsTable)
      .orderBy(desc(blogPostsTable.createdAt));
    return NextResponse.json(posts);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to list blog posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authErr = requireAdmin(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const parsed = insertBlogPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const data = { ...parsed.data };
    if (data.status === "published" && !data.publishedAt) {
      (data as any).publishedAt = new Date();
    }
    const [post] = await db.insert(blogPostsTable).values(data).returning();
    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}
