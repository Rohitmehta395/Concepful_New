import { NextRequest, NextResponse } from "next/server";
import { db } from "@workspace/db";
import { aiModelProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId: idStr } = await params;
    const companyId = parseInt(idStr);
    const [profile] = await db.select().from(aiModelProfilesTable)
      .where(eq(aiModelProfilesTable.companyId, companyId));
      
    if (!profile) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (err) {
    return NextResponse.json({ error: "Failed to get AI profile" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId: idStr } = await params;
    const companyId = parseInt(idStr);
    const body = await request.json();

    const existing = await db.select().from(aiModelProfilesTable)
      .where(eq(aiModelProfilesTable.companyId, companyId));

    if (existing.length > 0) {
      const [updated] = await db.update(aiModelProfilesTable)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(aiModelProfilesTable.companyId, companyId))
        .returning();
      return NextResponse.json(updated);
    }

    const [created] = await db.insert(aiModelProfilesTable)
      .values({ companyId, ...body })
      .returning();
    return NextResponse.json(created);
  } catch (err) {
    return NextResponse.json({ error: "Failed to upsert AI profile" }, { status: 500 });
  }
}
