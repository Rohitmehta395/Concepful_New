import { NextRequest, NextResponse } from "next/server";
import { db } from "@workspace/db";
import { planSelectionsTable } from "@workspace/db";

export async function GET(request: NextRequest) {
  try {
    const plans = await db.select().from(planSelectionsTable);

    const tiers = ["signal", "pulse", "cortex"];
    const byTier = tiers.map(tier => {
      const tierPlans = plans.filter(p => p.tier === tier);
      return {
        tier,
        clients: tierPlans.length,
        mrr: tierPlans.reduce((sum, p) => sum + (p.estimatedMonthlyTotal ?? p.basePrice ?? 0), 0),
      };
    });

    const total = byTier.reduce((sum, t) => sum + t.mrr, 0);
    return NextResponse.json({ total, byTier });
  } catch (err) {
    return NextResponse.json({ error: "Failed to get MRR data" }, { status: 500 });
  }
}
