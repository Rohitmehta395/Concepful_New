import { NextRequest, NextResponse } from "next/server";
import { db } from "@workspace/db";
import { companiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, id));
    
    if (!company) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(company);
  } catch (err) {
    return NextResponse.json({ error: "Failed to get company" }, { status: 500 });
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

    const [updated] = await db.update(companiesTable)
      .set(body)
      .where(eq(companiesTable.id, id))
      .returning();
      
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}
