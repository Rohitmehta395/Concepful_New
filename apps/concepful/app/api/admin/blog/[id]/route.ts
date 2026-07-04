import { NextRequest, NextResponse } from "next/server";
import { db } from "@workspace/db";
import { blogPostsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = requireAdmin(request);
  if (authErr) return authErr;

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id));
    
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (err) {
    return NextResponse.json({ error: "Failed to get blog post" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = requireAdmin(request);
  if (authErr) return authErr;

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();

    const updates: Record<string, any> = { ...body, updatedAt: new Date() };
    if (updates.status === "published" && !updates.publishedAt) {
      updates.publishedAt = new Date();
    }
    
    const [post] = await db
      .update(blogPostsTable)
      .set(updates)
      .where(eq(blogPostsTable.id, id))
      .returning();
      
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = requireAdmin(request);
  if (authErr) return authErr;

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id));
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
