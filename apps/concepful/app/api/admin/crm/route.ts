import { NextRequest, NextResponse } from "next/server";
import { db } from "@workspace/db";
import { crmContactsTable, insertCrmContactSchema } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const authErr = requireAdmin(request);
  if (authErr) return authErr;

  try {
    const contacts = await db
      .select()
      .from(crmContactsTable)
      .orderBy(desc(crmContactsTable.createdAt));
    return NextResponse.json(contacts);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to list CRM contacts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authErr = requireAdmin(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const parsed = insertCrmContactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const [contact] = await db.insert(crmContactsTable).values(parsed.data).returning();
    return NextResponse.json(contact, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
