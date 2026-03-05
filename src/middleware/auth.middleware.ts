import type { Request, Response, NextFunction } from "express";
import { getBearerToken, verifyToken } from "../utils/auth.js";
import { prisma } from "../utils/prisma.js";

export interface AuthRequest extends Request {
  user?: { id: string; email: string; name: string | null };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true },
  });
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  req.user = user;
  next();
}
