import { NextRequest, NextResponse } from "next/server";
import { db } from "@workspace/db";
import { onboardingSubmissionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const [submission] = await db.select().from(onboardingSubmissionsTable).where(eq(onboardingSubmissionsTable.id, id));
    
    if (!submission) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(submission);
  } catch (err) {
    return NextResponse.json({ error: "Failed to get onboarding" }, { status: 500 });
  }
}
