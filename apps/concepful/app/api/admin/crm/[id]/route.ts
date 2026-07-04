import { NextRequest, NextResponse } from "next/server";
import { db } from "@workspace/db";
import { crmContactsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = requireAdmin(request);
  if (authErr) return authErr;

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const [contact] = await db.select().from(crmContactsTable).where(eq(crmContactsTable.id, id));
    
    if (!contact) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(contact);
  } catch (err) {
    return NextResponse.json({ error: "Failed to get contact" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = requireAdmin(request);
  if (authErr) return authErr;

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();

    const [contact] = await db
      .update(crmContactsTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(crmContactsTable.id, id))
      .returning();
      
    if (!contact) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(contact);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = requireAdmin(request);
  if (authErr) return authErr;

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    await db.delete(crmContactsTable).where(eq(crmContactsTable.id, id));
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}
