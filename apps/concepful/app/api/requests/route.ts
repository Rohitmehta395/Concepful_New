import { NextRequest, NextResponse } from "next/server";
import { db } from "@workspace/db";
import { workRequestsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyIdParam = searchParams.get("companyId");
    const companyId = companyIdParam ? parseInt(companyIdParam) : null;
    const status = searchParams.get("status") ?? undefined;

    if (companyId && status) {
      const results = await db.select().from(workRequestsTable)
        .where(and(eq(workRequestsTable.companyId, companyId), eq(workRequestsTable.status, status)))
        .orderBy(workRequestsTable.createdAt);
      return NextResponse.json(results);
    } else if (companyId) {
      const results = await db.select().from(workRequestsTable)
        .where(eq(workRequestsTable.companyId, companyId))
        .orderBy(workRequestsTable.createdAt);
      return NextResponse.json(results);
    } else if (status) {
      const results = await db.select().from(workRequestsTable)
        .where(eq(workRequestsTable.status, status))
        .orderBy(workRequestsTable.createdAt);
      return NextResponse.json(results);
    }

    const results = await db.select().from(workRequestsTable).orderBy(workRequestsTable.createdAt);
    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json({ error: "Failed to list requests" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const [req] = await db.insert(workRequestsTable).values(body).returning();
    return NextResponse.json(req, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}
