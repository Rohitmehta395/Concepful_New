import { NextRequest, NextResponse } from "next/server";
import { db } from "@workspace/db";
import { brandProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId: idStr } = await params;
    const companyId = parseInt(idStr);
    const [profile] = await db.select().from(brandProfilesTable)
      .where(eq(brandProfilesTable.companyId, companyId));
    
    if (!profile) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (err) {
    return NextResponse.json({ error: "Failed to get brand profile" }, { status: 500 });
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

    const existing = await db.select().from(brandProfilesTable)
      .where(eq(brandProfilesTable.companyId, companyId));

    if (existing.length > 0) {
      const [updated] = await db.update(brandProfilesTable)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(brandProfilesTable.companyId, companyId))
        .returning();
      return NextResponse.json(updated);
    }

    const [created] = await db.insert(brandProfilesTable)
      .values({ companyId, ...body })
      .returning();
    return NextResponse.json(created);
  } catch (err) {
    return NextResponse.json({ error: "Failed to upsert brand profile" }, { status: 500 });
  }
}
