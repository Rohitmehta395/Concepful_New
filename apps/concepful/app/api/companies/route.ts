import { NextRequest, NextResponse } from "next/server";
import { db } from "@workspace/db";
import { companiesTable } from "@workspace/db";

export async function GET(request: NextRequest) {
  try {
    const companies = await db.select().from(companiesTable).orderBy(companiesTable.createdAt);
    return NextResponse.json(companies);
  } catch (err) {
    return NextResponse.json({ error: "Failed to list companies" }, { status: 500 });
  }
}
