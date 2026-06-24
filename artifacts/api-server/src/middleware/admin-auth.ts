import { Request, Response, NextFunction } from "express";

/**
 * Admin token middleware.
 * Set ADMIN_TOKEN env var to enable protection.
 * In development (NODE_ENV !== 'production') with no ADMIN_TOKEN set,
 * the check is skipped so local dev works without configuration.
 * In production, ADMIN_TOKEN must be set or the endpoint returns 503.
 */
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? null;

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!ADMIN_TOKEN) {
    if (process.env.NODE_ENV === "production") {
      return res.status(503).json({ error: "Admin not configured" });
    }
    // Development: pass through without a token to ease local development
    return next();
  }

  const token = req.headers["x-admin-token"] as string | undefined;
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
