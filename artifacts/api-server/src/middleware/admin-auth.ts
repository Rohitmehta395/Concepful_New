import { Request, Response, NextFunction } from "express";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "concepful-admin-dev";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["x-admin-token"] as string | undefined;
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
