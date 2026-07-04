import { NextRequest, NextResponse } from "next/server";
import { db } from "@workspace/db";
import { workRequestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const [req] = await db.select().from(workRequestsTable).where(eq(workRequestsTable.id, id));
    if (!req) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(req);
  } catch (err) {
    return NextResponse.json({ error: "Failed to get request" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();

    const [updated] = await db.update(workRequestsTable)
      .set(body)
      .where(eq(workRequestsTable.id, id))
      .returning();
      
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
