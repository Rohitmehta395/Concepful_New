import { NextRequest, NextResponse } from "next/server";
import { db } from "@workspace/db";
import { portfolioItemsTable, insertPortfolioItemSchema } from "@workspace/db";
import { asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const authErr = requireAdmin(request);
  if (authErr) return authErr;

  try {
    const items = await db
      .select()
      .from(portfolioItemsTable)
      .orderBy(asc(portfolioItemsTable.sortOrder), asc(portfolioItemsTable.createdAt));
    return NextResponse.json(items);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to list portfolio items" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authErr = requireAdmin(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const parsed = insertPortfolioItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const [item] = await db.insert(portfolioItemsTable).values(parsed.data).returning();
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create portfolio item" }, { status: 500 });
  }
}
