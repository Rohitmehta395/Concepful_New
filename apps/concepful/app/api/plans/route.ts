import { NextRequest, NextResponse } from "next/server";
import { db } from "@workspace/db";
import { planSelectionsTable } from "@workspace/db";

export async function GET(request: NextRequest) {
  try {
    const plans = await db.select().from(planSelectionsTable).orderBy(planSelectionsTable.createdAt);
    return NextResponse.json(plans);
  } catch (err) {
    return NextResponse.json({ error: "Failed to list plans" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const [plan] = await db.insert(planSelectionsTable).values(body).returning();
    return NextResponse.json(plan, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}
