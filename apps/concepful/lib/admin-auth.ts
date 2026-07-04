import { NextRequest, NextResponse } from "next/server";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? null;

export function requireAdmin(req: NextRequest): NextResponse | null {
  if (!ADMIN_TOKEN) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
    }
    // Development: pass through without a token to ease local development
    return null;
  }

  const token = req.headers.get("x-admin-token");
  if (!token || token !== ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  return null;
}
