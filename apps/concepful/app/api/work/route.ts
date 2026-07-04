import { NextRequest, NextResponse } from "next/server";
import { db } from "@workspace/db";
import { completedWorkTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyIdParam = searchParams.get("companyId");
    const companyId = companyIdParam ? parseInt(companyIdParam) : null;

    if (companyId) {
      const results = await db.select().from(completedWorkTable)
        .where(eq(completedWorkTable.companyId, companyId))
        .orderBy(completedWorkTable.completedAt);
      return NextResponse.json(results);
    }
    const results = await db.select().from(completedWorkTable).orderBy(completedWorkTable.completedAt);
    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json({ error: "Failed to list completed work" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const [work] = await db.insert(completedWorkTable).values(body).returning();
    return NextResponse.json(work, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create completed work" }, { status: 500 });
  }
}
