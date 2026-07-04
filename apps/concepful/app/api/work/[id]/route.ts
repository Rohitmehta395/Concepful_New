import { NextRequest, NextResponse } from "next/server";
import { db } from "@workspace/db";
import { completedWorkTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();

    const [updated] = await db.update(completedWorkTable)
      .set(body)
      .where(eq(completedWorkTable.id, id))
      .returning();
      
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update completed work" }, { status: 500 });
  }
}
