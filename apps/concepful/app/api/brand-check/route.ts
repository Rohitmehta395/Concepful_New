import { NextRequest, NextResponse } from "next/server";
import { db } from "@workspace/db";
import { brandChecksTable, brandProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

function mockBrandCheck(inputText: string, profile: any) {
  const text = inputText.toLowerCase();

  // Score based on heuristics
  const toneWords = profile?.toneWords ?? [];
  const bannedWords = profile?.bannedWords ?? [];

  const hasBannedWords = bannedWords.some((w: string) => text.includes(w.toLowerCase()));
  const toneMatchCount = toneWords.filter((w: string) => text.includes(w.toLowerCase())).length;
  const toneScore = Math.min(100, 60 + toneMatchCount * 10 - (hasBannedWords ? 20 : 0));
  const colorScore = Math.floor(70 + Math.random() * 25);
  const messagingScore = Math.floor(65 + Math.random() * 30);
  const typographyScore = Math.floor(72 + Math.random() * 22);
  const alignmentScore = Math.round((toneScore + colorScore + messagingScore + typographyScore) / 4);

  const recommendations = [];
  if (toneScore < 75) recommendations.push("Align tone of voice more closely with brand guidelines — consider using words like " + (toneWords.slice(0, 2).join(", ") || "confident, clear, premium"));
  if (hasBannedWords) recommendations.push("Remove banned phrases that conflict with brand positioning");
  if (colorScore < 80) recommendations.push("Color references are not consistently aligned with the approved palette");
  if (messagingScore < 75) recommendations.push("Messaging clarity can be improved — lead with the outcome, not the process");
  if (typographyScore < 80) recommendations.push("Typography hierarchy appears inconsistent — ensure primary headings stand out");
  if (recommendations.length === 0) recommendations.push("Strong brand alignment across all dimensions — well executed");

  return { alignmentScore, toneScore, colorScore, messagingScore, typographyScore, recommendations };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, inputText, inputType } = body;

    const [profile] = await db.select().from(brandProfilesTable)
      .where(eq(brandProfilesTable.companyId, companyId));

    const scores = mockBrandCheck(inputText, profile);

    const [check] = await db.insert(brandChecksTable).values({
      companyId,
      inputText,
      inputType: inputType ?? "text",
      ...scores,
    }).returning();

    return NextResponse.json(check);
  } catch (err) {
    return NextResponse.json({ error: "Failed to run brand check" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyIdStr = searchParams.get("companyId");
    if (!companyIdStr) {
      return NextResponse.json({ error: "companyId is required" }, { status: 400 });
    }
    const companyId = parseInt(companyIdStr);

    const checks = await db.select().from(brandChecksTable)
      .where(eq(brandChecksTable.companyId, companyId))
      .orderBy(brandChecksTable.createdAt);
    return NextResponse.json(checks);
  } catch (err) {
    return NextResponse.json({ error: "Failed to list brand checks" }, { status: 500 });
  }
}
