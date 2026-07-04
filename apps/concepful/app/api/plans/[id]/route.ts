import { NextRequest, NextResponse } from "next/server";
import { db } from "@workspace/db";
import { planSelectionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const [plan] = await db.select().from(planSelectionsTable).where(eq(planSelectionsTable.id, id));
    
    if (!plan) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(plan);
  } catch (err) {
    return NextResponse.json({ error: "Failed to get plan" }, { status: 500 });
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

    const [updated] = await db.update(planSelectionsTable)
      .set(body)
      .where(eq(planSelectionsTable.id, id))
      .returning();
      
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}
