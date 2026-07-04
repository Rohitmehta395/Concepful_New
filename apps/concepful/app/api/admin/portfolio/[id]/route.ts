import { NextRequest, NextResponse } from "next/server";
import { db } from "@workspace/db";
import { portfolioItemsTable } from "@workspace/db";
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
    const [item] = await db.select().from(portfolioItemsTable).where(eq(portfolioItemsTable.id, id));
    
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (err) {
    return NextResponse.json({ error: "Failed to get portfolio item" }, { status: 500 });
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

    const [item] = await db
      .update(portfolioItemsTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(portfolioItemsTable.id, id))
      .returning();
      
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update portfolio item" }, { status: 500 });
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
    await db.delete(portfolioItemsTable).where(eq(portfolioItemsTable.id, id));
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete portfolio item" }, { status: 500 });
  }
}
